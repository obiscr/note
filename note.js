#!/usr/bin/env node

const fs = require('fs')
const os = require('os')

const workspace = os.homedir() + '/' + '.cnote'
const config = workspace + '/' + 'conf'

function run (myArgs) {
    if (myArgs.length === 0){
        console.log("All notes:")
        list()
    } else if (myArgs.length === 1){
        if ("-h" === myArgs[0] || myArgs[0] === '--help') {
            console.log("Usage: " +
                "\n\tnote               --show all notes " +
                "\n\tnote -i            --initialization " +
                "\n\tnote -a key value  --add note " +
                "\n\tnote -d key        --delete note " +
                "\n\tnote -e key value  --edit note value " +
                "\n\tnote -s keyword    --search in notes " +
                "\n\tnote -h            --show help")
        } else if ("-v" === myArgs[0] || "--version" === myArgs[0]) {
            const packageInfo = require('./package.json');
            console.log(packageInfo.version);
        } else if ("-i" === myArgs[0]) {
            initialization()
        } else {
            console.error("Invalid Argument. Add -h show usage.");
        }
    } else if (myArgs.length === 2){
        if ("-d" === myArgs[0]) {
            del(myArgs[1])
        } else if("-s" === myArgs[0]) {
            search(myArgs[1])
        } else {
            console.error("Invalid Argument. Add -h show usage.");
        }
    } else if (myArgs.length === 3){
        if ("-a" === myArgs[0]) {
            add(myArgs[1],myArgs[2])
        } else if ("-e" === myArgs[0]) {
            edit(myArgs[1],myArgs[2])
        } else {
            console.error("Invalid Argument. Add -h show usage.");
        }
    }
}
run(process.argv.slice(2));

function list() {
    const notes = fs.readFileSync(config,'utf8');
    notes.split('\n').forEach(line =>  {
        console.log(line)
    });
}

function search(keyword) {
    const notes = fs.readFileSync(config,'utf8');
    notes.split('\n').forEach(line =>  {
        if (line.includes(keyword)) {
            console.log(line)
        }
    });
}

function initialization() {
    if (!fs.existsSync(workspace)){
        fs.mkdirSync(workspace, { recursive: true });
        console.log("[Info]Create workspace successful")
    } else {
        console.log("[Warn]Workspace already exists")
    }

    if (!fs.existsSync(config)){
        fs.writeFile(config, "", (err) => {
            if (err) console.log("[Error]Create config file failed:" + err)
            console.log("[Info]Create config file successful")
        });
    } else {
        console.log("[Warn]Config file already exists")
    }
}

function add(key,value) {
    const ex = exists(key)
    if (ex.exists) {
        console.log("The key [" + key + "] already exists in " + config + ":" + ex.lineNum + ", place use `cnote -e " + key + " value` to update it.")
    } else {
        const note = key + "=" + value + "\n"
        fs.appendFile(config, note, (err) => {
            if (err) console.log("Add note error: " + note);
            console.log("Add note: " + note);
        });
    }
}

function exists(key) {
    let exists = false;
    let lineNum = 0;
    let i = 0
    const notes = fs.readFileSync(config,'utf8');
    notes.split('\n').forEach(line =>  {
        i++
        if (line.startsWith(key + "=")){
            exists = true
            lineNum = i;
        }
    });
    return {exists, lineNum}
}

function edit(key,value) {
    const ex = exists(key)
    if (!ex.exists) {
        console.log("Not found " + key + " in:" + config)
    } else {
        let data = fs.readFileSync(config, 'utf-8');
        const oldLine = getLine(key)
        const note = key + "=" + value
        const newValue = data.replace(oldLine, note);
        fs.writeFileSync(config, newValue, 'utf-8');
        console.log("Edit note[old]: " + oldLine)
        console.log("Edit note[new]: " + note)
    }
}

function del(key) {
    const ex = exists(key)
    if (!ex.exists) {
        console.log("Not found " + key + " in:" + config)
    } else {
        let data = fs.readFileSync(config, 'utf-8');
        const oldLine = getLine(key) + "\n"
        const newValue = data.replace(oldLine, "");
        fs.writeFileSync(config, newValue, 'utf-8');
        console.log("Delete note: " + oldLine)
    }
}

function getLine(key) {
    let result = "";
    const notes = fs.readFileSync(config,'utf8');
    notes.split('\n').forEach(line =>  {
        if (line.startsWith(key + "=")){
            result = line
            return false
        }
    });
    return result
}
