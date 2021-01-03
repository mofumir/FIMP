'use strict'

const contextmenus = browser.contextMenus;
const storage = browser.storage;
const local = storage.local;

function handleInstalled(details) {
  console.log(details.reason)
  if (details.reason === "install") {
    changeSettings("default");
  }
  if (details.reason === "update") {
    generateContextMenus();
  }
};
browser.runtime.onInstalled.addListener(handleInstalled);

browser.storage.onChanged.addListener(() => {
  generateContextMenus();
});
const handleResponse = (message) => {
  // do something
}



const notify = (str) => {
  const handleError = (error) => {
    console.log(error)
    if (error.message === "Could not establish connection. Receiving end does not exist.") {
      // executes in background, will not likely to work if it was in firefox.... probably better if i made a popup instead
      alert(str)
    }
  }
  const tabs = browser.tabs.query({
    active: true,
    currentWindow: true
  })
  const notify = (tabs) => {
    browser.tabs.sendMessage(tabs[0].id, {
      message: str
    }).catch(handleError)
    console.log(tabs[0].id)
  }
  tabs.then(notify).catch(handleError)
}

const calcEvent = contextmenus.onClicked.addListener((info) => {
  local.get(null).then((data) => {
    const selectedMenu = Number(info.menuItemId.replace(/\D/g, ""));
    const selection = info.selectionText;
    const {
      fromUnit,
      toUnit,
      exprTemp,
      presetName
    } = data.settings[selectedMenu];
    const result = calc(selection, exprTemp);
    if (typeof result === "number") {
      notify(`${selection}${fromUnit} is ${result}${toUnit}`);
    }
  });
});



async function addSetting(fromUnit, toUnit, exprTemp, presetName, showPresetNameOnContextMenu) {
  local.get(null).then((givenData) => {
    async function validateNewSetting() {
      const obj = {
        fromUnit: fromUnit,
        toUnit: toUnit,
        exprTemp: exprTemp,
        presetName: presetName,
        showPresetNameOnContextMenu: showPresetNameOnContextMenu
      };
      const tmpData = givenData;
      // this could be any number
      const testNum = "5";
      const result = calc(testNum, exprTemp);
      try {
        if (typeof result === "number") {
          tmpData.settings.push(obj);
          return tmpData;
        } else {
          throw new Error(
            `testing of expression template returned an error, new setting will not be saved`
          );
        }
      } catch (e) {
        notify(e);
      }
    }

    validateNewSetting().then((newObj) => {
      changeSettings(newObj);
    });
  });
}

async function deleteSetting(index) {
  local.get(null).then((givenData) => {
    async function validateNewSetting() {
      const tmpData = givenData;
      tmpData.settings.splice(index, 1);
      console.log(tmpData);
      return tmpData;
    }

    validateNewSetting().then((newObj) => {
      changeSettings(newObj);
    });
  });
}

async function changeSettings(obj) {
  const objType = typeof obj;
  const templateNoMatchError = new Error(`Given object does not follow required pattern`)
  const defaultSetting = {
    settings: [{
        fromUnit: "inch",
        toUnit: "cm",
        exprTemp: "#{x}*2.84",
        presetName: "Inch to Centimeter",
        showPresetNameOnContextMenu: false
      },
      {
        fromUnit: "℉",
        toUnit: "℃",
        exprTemp: "(#{x}-32)*5/9",
        presetName: "Fahrenheit to Celsius",
        showPresetNameOnContextMenu: false
      },
    ],
  };

  if (obj === "default") {
    local.set(defaultSetting).then(() => {
      console.log("storage is set to default");
    });
  } else if (objType === "object") {
    const validateObject = async () => {
      if (obj.hasOwnProperty('settings')) {

        obj.settings.forEach(el => {
          const settingTemplateKeys = Object.keys(defaultSetting.settings[0]).sort();
          const objSettingKeys = Object.keys(el).sort();
          if (!arraysEqual(objSettingKeys, settingTemplateKeys)) {
            throw templateNoMatchError
          }
        })
        return obj;

      } else {
        throw templateNoMatchError
      }
    }

    validateObject().then((newObj) => {
      local.set(newObj).then(() => {
        console.log("new setting has set");
      })
    })

  } else {
    throw new Error(`Given param is not "default" or Object`);
  }
}

const calc = (target, exprTemp) => {
  const regex = /#{x}/gi;
  try {
    if (!exprTemp.match(regex)) {
      throw "xyzUndefined";
    } else {
      const expr = exprTemp.replace(regex, target);
      return math.evaluate(expr);
    }
  } catch (e) {
    if (e === "xyzUndefined") {
      notify(
        `This expression template does not have #{x}, therefore it will not convert selected numbers! please include those in template`
      );
    } else {
      // definitely not was lazy to implement validation of if selected was wrong or template is fucked
      notify(
        `Could not calculate! check if selected text was number`
      );
    }
  }
};

const generateContextMenus = async function () {
  await contextmenus.removeAll().then(() => {
    contextmenus.create({
      id: "parent",
      title: "Convert this selected number",
      contexts: ["selection"],
    })
  })

  const handleChilds = () => (local.get(null).then((givenData) => {
    givenData.settings.forEach((el, i) => {
      const menuTitleGenerate = async (el) => {
        if (el.showPresetNameOnContextMenu == true) {
          return `${el.presetName}`
        } else {
          return `${el.fromUnit} to ${el.toUnit}`
        }
      }

      menuTitleGenerate(el).then((str) => {
        contextmenus.create({
          id: `unit${i}`,
          title: str,
          parentId: "parent",
          contexts: ["selection"],
        })
      })
    })
  }))

  handleChilds()

}

function arraysEqual(a, b) {
  /*
      Array-aware equality checker:
      Returns whether arguments a and b are == to each other;
      however if they are equal-lengthed arrays, returns whether their 
      elements are pairwise == to each other recursively under this
      definition.
  */
  if (a instanceof Array && b instanceof Array) {
    if (a.length != b.length) // assert same length
      return false;
    for (var i = 0; i < a.length; i++) // assert each element equal
      if (!arraysEqual(a[i], b[i]))
        return false;
    return true;
  } else {
    return a == b; // if not both arrays, should be the same
  }
}