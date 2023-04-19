const windowStateManager = require('electron-window-state');
const { app, BrowserWindow, ipcMain, dialog, session } = require('electron');
const contextMenu = require('electron-context-menu');
const serve = require('electron-serve');
const path = require('path');
const usb = require('usb');
const serialport = require('serialport');
const { Buffer } = require('buffer');
global.Buffer = Buffer;
try {
	require('electron-reloader')(module);
} catch (e) {
	console.error(e);
}
app.commandLine.appendSwitch('disable-hid-blocklist');
const serveURL = serve({ directory: '.' });
const port = process.env.PORT || 5173;
const dev = !app.isPackaged;
let mainWindow;

function createWindow() {
	let windowState = windowStateManager({
		defaultWidth: 800,
		defaultHeight: 600,
	});

	let grantedDeviceThroughPermHandler;

	const mainWindow = new BrowserWindow({
		backgroundColor: 'whitesmoke',
		titleBarStyle: 'visible',
		autoHideMenuBar: true,
		trafficLightPosition: {
			x: 17,
			y: 32,
		},
		minHeight: 450,
		minWidth: 500,
		webPreferences: {
			enableRemoteModule: true,
			contextIsolation: true,
			nodeIntegration: true,
			spellcheck: false,
			devTools: dev,
			preload: path.join(__dirname, 'preload.cjs'),
		},
		x: windowState.x,
		y: windowState.y,
		width: windowState.width,
		height: windowState.height,
	});

	mainWindow.webContents.session.on('select-usb-device', (event, details, callback) => {
		// Add events to handle devices being added or removed before the callback on
		// `select-usb-device` is called.
		mainWindow.webContents.session.on('usb-device-added', (event, device) => {
			console.log('usb-device-added FIRED WITH', device);
			// Optionally update details.deviceList
		});

		mainWindow.webContents.session.on('usb-device-removed', (event, device) => {
			console.log('usb-device-removed FIRED WITH', device);
			// Optionally update details.deviceList
		});

		event.preventDefault();
		if (details.deviceList && details.deviceList.length > 0) {
			const deviceToReturn = details.deviceList.find((device) => {
				if (
					!grantedDeviceThroughPermHandler ||
					device.deviceId !== grantedDeviceThroughPermHandler.deviceId
				) {
					return true;
				}
			});
			if (deviceToReturn) {
				callback(deviceToReturn.deviceId);
			} else {
				callback();
			}
		}
	});

	mainWindow.webContents.session.setPermissionCheckHandler(
		(webContents, permission, requestingOrigin, details) => {
			if (permission === 'usb' && details.securityOrigin === 'file:///') {
				return true;
			}
		},
	);

	mainWindow.webContents.session.setDevicePermissionHandler((details) => {
		if (details.deviceType === 'usb' && details.origin === 'file://') {
			if (!grantedDeviceThroughPermHandler) {
				grantedDeviceThroughPermHandler = details.device;
				return true;
			} else {
				return false;
			}
		}
	});

	windowState.manage(mainWindow);

	mainWindow.once('ready-to-show', () => {
		mainWindow.show();
		mainWindow.focus();
	});

	mainWindow.on('close', () => {
		windowState.saveState(mainWindow);
	});

	return mainWindow;
}

// Listen for a request from the renderer process to request USB permission
ipcMain.on('request-usb-permission', async (event) => {
	const { response } = await dialog.showMessageBox({
		type: 'question',
		buttons: ['Grant', 'Deny'],
		message: 'Do you want to allow this app to access your USB device?',
	});

	// Send the permission status back to the renderer process
	event.sender.send('usb-permission-status', response === 0 ? 'granted' : 'denied');
});

contextMenu({
	showLookUpSelection: false,
	showSearchWithGoogle: false,
	showCopyImage: false,
	prepend: (defaultActions, params, browserWindow) => [
		{
			label: 'Make App 💻',
		},
	],
});

function loadVite(port) {
	mainWindow.loadURL(`http://localhost:${port}`).catch((e) => {
		console.log('Error loading URL, retrying', e);
		setTimeout(() => {
			loadVite(port);
		}, 200);
	});
}

function createMainWindow() {
	mainWindow = createWindow();
	mainWindow.once('close', () => {
		mainWindow = null;
	});

	if (dev) loadVite(port);
	else serveURL(mainWindow);
}

app.whenReady().then(() => {
	createMainWindow();
	require('@electron/remote/main').initialize();
});
app.on('activate', () => {
	if (!mainWindow) {
		createMainWindow();
	}
});
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

ipcMain.on('to-main', (event, count) => {
	// return mainWindow.webContents.send('from-main', `next count is ${count + 1}`);
});
