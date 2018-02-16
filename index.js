const electron = require("electron");
const url = require("url");
const path = require("path");
const Store = require('electron-store');
const store = new Store();

const {app, BrowserWindow, Menu, ipcMain} = electron;

const windowsBase = "C:\\Program Files (x86)\\Steam\\SteamApps\\common\\Starbound\\win32\\"
const darwinBase = require("os").homedir() + "/Library/Application Support/Steam/steamapps/common/Starbound/osx/"
const linuxBase = "C;\\Program Files (x86)\\Steam\\SteamApps\\common\\Starbound\\win32\\"

console.log(darwinBase);

let mainWindow;

app.on("ready", () => {
    // Create window
    mainWindow = new BrowserWindow({
        title: "UnPAKer",
        width: 800,
        height: 380,
        useContentSize: true,
        resizable: false,
        maximizable: false,
        fullscreen: false,
        fullscreenable: false,
        autoHideMenuBar: true,
        titleBarStyle: "hiddenInset"
        // TODO: add icon
    });

    // Prevent zoom
    mainWindow.webContents.executeJavaScript("require(\"electron\").webFrame.setZoomLevelLimits(1, 1);")
    // Prevent file drag and drop
    mainWindow.webContents.on("will-navigate", (event) => {
      event.preventDefault()
    })

    // Load html into window
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, "mainWindow.html"),
        protocol: "file:",
        slashes: true
    }));
    // Quit app when main window closed
    mainWindow.on("close", () => {
        app.quit();
    });

    // Build menu from template
    const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
    // Insert template
    Menu.setApplicationMenu(mainMenu);
})

// Catch messages from render process
ipcMain.on("dopak", (e, workingFolder, workingPak) => {
    mainWindow.webContents.send("message", 'info', `Recieved dopak: ${workingFolder}, ${workingPak}`);
});
ipcMain.on("dounpak", (e, workingPak, workingFolder) => {
    mainWindow.webContents.send("message", 'info', `Recieved dounpak: ${workingPak}, ${workingFolder}`);
});
ipcMain.on("configure", (e, pakBin, unpakBin) => {

    store.set('pakBin', pakBin);
    store.set('unpakBin', unpakBin);

    mainWindow.webContents.send("message", 'info', `Saved configuration: ${store.get('pakBin')}, ${store.get('unpakBin')}`);
});

// Create menu template
const mainMenuTemplate = [
    {
        label:"File",
        submenu: [
            {
                label: "Toggle DevTools",
                accelerator: "Shift+CmdOrCtrl+I",
                click(item, focusedWindow) {
                    focusedWindow.toggleDevTools();
                }
            },
            {
                role: "reload"
            },
            { type: "separator" },
            {
                label: "Quit",
                accelerator: "CmdORCtrl+Q",
                click() {
                    app.quit();
                }
            }
        ]
    },
    {
        label: "Edit",
        submenu: [
            { label: "Undo", accelerator: "CmdOrCtrl+Z", selector: "undo:" },
            { label: "Redo", accelerator: "Shift+CmdOrCtrl+Z", selector: "redo:" },
            { type: "separator" },
            { label: "Cut", accelerator: "CmdOrCtrl+X", selector: "cut:" },
            { label: "Copy", accelerator: "CmdOrCtrl+C", selector: "copy:" },
            { label: "Paste", accelerator: "CmdOrCtrl+V", selector: "paste:" },
            { label: "Select All", accelerator: "CmdOrCtrl+A", selector: "selectAll:" }
        ]
    }
];