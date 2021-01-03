const background = browser.extension.getBackgroundPage()
const storage = browser.storage;
const local = storage.local;
const presetNamesArray = [];

document.addEventListener('DOMContentLoaded', () => {
    local.get(null).then(data => {
        const presets = data.settings;
        presets.forEach((el, i) => {
            console.log(i, el)
            const presetsContainer = document.getElementById('presets');
            const row = document.createElement("tr");

            const cellCreate = exprTemp => {
                const td = document.createElement("td");
                td.textContent = exprTemp;
                return td
            }

            // this is so ugly i need to do something about this

            const fromUnit = cellCreate(el.fromUnit);
            const toUnit = cellCreate(el.toUnit);
            const exprTemp = cellCreate(el.exprTemp);
            const presetName = cellCreate(el.presetName);
            presetNamesArray.push(el.presetName);
            const showNameOnContext = cellCreate(el.showPresetNameOnContextMenu);
            row.append(presetName)
            row.append(fromUnit)
            row.append(toUnit)
            row.append(exprTemp)
            row.append(showNameOnContext)


            const td = document.createElement("td");
            const btn = document.createElement("button")
            btn.type = "button";
            btn.className = "btn btn-danger"
            btn.id = "unit" + i.toString()
            btn.textContent = `del`
            btn.onclick = () => {
                deleteSelectedSetting(i)
            }
            td.append(btn)
            row.append(td)

            presetsContainer.append(row)
        });
    })
});
const createButton = document.getElementById('createSetting')
document.getElementById('default').addEventListener('click', setDefaultSetting)
createButton.addEventListener('click', createNewOption)

storage.onChanged.addListener(handleChanges)

function handleChanges(changes, area) {
    console.log(changes, area)
    location.reload()
}

document.addEventListener("keyup", event => {
    const showPresetNameOnContextMenuCheckBox = document.getElementById("presetNameOnContext");
    const newPresetName = document.getElementById("newPresetName").value;
    const newFromUnit = document.getElementById("newFromUnit").value;
    const newToUnit = document.getElementById("newToUnit").value;
    const newExprTemp = document.getElementById("newExprTemp").value;
    const target = event.target

    const validatePresetName = presetName => {
        if (!presetName) return 'Preset name is required'
        else if (presetNamesArray.indexOf(presetName) > -1) return 'Preset name must be unique'
        else return '';
    }

    const validateExprTemp = exprTemp => {
        const regex = /#{x}/gi;
        const test = () => {
            const expr = exprTemp.replace(regex, 2);
            try {
                const result = math.evaluate(expr);
                if (typeof result === "number") return true
                else return false
            } catch {
                return false
            }
        }

        if (!exprTemp) return 'Expression Template is required'
        else if (!exprTemp.match(regex)) return 'Variable required, please include #{x} in expression'
        else if (!test()) {
            return 'Expression uncalculatable'
        } else return ''
    }

    const presetNameResult = validatePresetName(newPresetName);
    const exprTempResult = validateExprTemp(newExprTemp)

    if (target.id == "newPresetName") {
        const errorText = document.getElementById("presetErrorMessage")
        errorText.innerText = presetNameResult;
        if (presetNameResult === '') {
            target.className = "form-control is-valid"
        } else {
            target.className = "form-control is-invalid"
        }
    }

    if (target.id == "newExprTemp") {
        const errorText = document.getElementById("exprTempErrorMessage")
        errorText.innerText = exprTempResult;
        if (exprTempResult === '') {
            target.className = "form-control is-valid"
        } else {
            target.className = "form-control is-invalid"
        }
    }

    if (newFromUnit == "" || newToUnit == "") {
        showPresetNameOnContextMenuCheckBox.disabled = true
    } else if (!newFromUnit == "" && !newToUnit == "") {
        showPresetNameOnContextMenuCheckBox.disabled = false
    }
    if (presetNameResult == "" && exprTempResult == "") {
        createButton.disabled = false
        createButton.className = "btn btn-primary mx-1"
    } else {
        createButton.disabled = true
        createButton.className = "btn btn-outline-danger mx-1"
    }
})

// just bunch of functions for modifying settings from page
function deleteSelectedSetting(index) {
    const i = index;
    if (confirm('Delete this setting?'))
        background.deleteSetting(i)
}

function createNewOption() {
    const checks = (checkboxId) => {
        const element = checkboxId;
        const disabled = element.disabled;
        const checked = element.checked;
        if (disabled || checked) {
            return true
        } else if (!disabled && !checked) {
            return false
        }
    }
    const newPresetName = document.getElementById("newPresetName").value;
    const newFromUnit = document.getElementById("newFromUnit").value;
    const newToUnit = document.getElementById("newToUnit").value;
    const newExprTemp = document.getElementById("newExprTemp").value;


    const showPresetNameOnContextMenu = checks(document.getElementById("presetNameOnContext"))
    if (confirm('Add this preset?'))
        background.addSetting(newFromUnit, newToUnit, newExprTemp, newPresetName, showPresetNameOnContextMenu)
}

function setDefaultSetting() {
    if (confirm('Set to default setting?'))
        background.changeSettings("default")
    console.log("defaultButton fired")
}