import * as fsPromises from "fs/promises";
import { baseItem, successItem } from "./itemsType";
import tool from "./index";
const path = require("path");
/**
 * 用于处理且已经处理 以作者为单位的漫画
 * 并梳理目录层级、使用方法剔除未汉化
 * 辅助手动删除，并溯源返回
 */

const translated = [
  "汉化",
  "漢化",
  "翻訳",
  "翻譯",
  "扫图",
  "掃圖",
  "自扫",
  "个人",
  "個人",
  "机翻",
  "嵌",
  "翻",
  "新视界",
  "新視界",
  "中文",
  "CE家族社",
  "新桥月白",
  "茜新社",
  "組",
  "组",
  "工房",
  "pixiv",
  "Pixiv"
];
interface authorType {
  [index: string]: number;
}
class HandleTempFile extends tool {
  translateds: string[];
  baseUrl: string;
  constructor(baseUrl: string) {
    super(baseUrl);
    this.translateds = translated;
    this.baseUrl = baseUrl;
  }

  // 读取JSON之后进行逻辑操作
  async readJsonFile() {
    const files = await fsPromises.readFile(this.baseUrl, "utf8");
    console.log(typeof files);
    const fileJson: successItem[] = JSON.parse(files);
    const translatedGroupTrue: Array<baseItem> = [];
    const translatedGroupFalse: Array<baseItem> = [];
    fileJson.forEach((element) => {
      if (translated.some((tItem) => element.dirName.includes(tItem))) {
        translatedGroupTrue.push(element);
      } else {
        translatedGroupFalse.push(element);
      }
    });
    console.log("汉化：", translatedGroupTrue.length);
    console.log("未汉化：", translatedGroupFalse.length);

    // 看那个作者的未汉化数量高
    let authorTranslated: authorType = {};
    let authorTranslatedList: authorType[] = [];
    translatedGroupFalse.forEach((item) => {
      if (authorTranslated[item.author]) {
        authorTranslated[item.author]++;
      } else {
        authorTranslated[item.author] = 1;
      }
    });
    for (let key in authorTranslated) {
      authorTranslatedList.push({
        [key]: authorTranslated[key],
      });
    }
    authorTranslatedList.sort((a, b) => {
      if (a[Object.keys(a)[0]] > b[Object.keys(b)[0]]) {
        return -1;
      } else {
        return 1;
      }
    });
    console.log('含有未汉化作者数', authorTranslatedList.length);
    console.log(authorTranslatedList);
    // 导出未汉化的本子
    this.writeFileJson(
      JSON.stringify(translatedGroupFalse, null, "\t"),
      "./translatedGroupFalse.json"
    );
  }

  // 批量移动/剪切本子
  async batchMoveDir(jsonFileUrl: string, tempDirUrl: string) {
    const files = await fsPromises.readFile(jsonFileUrl, "utf8");
    console.log(typeof files);
    const fileJson: successItem[] = JSON.parse(files);
    for (let item of fileJson) {
      await fsPromises.rename(item.dirUrl, path.join(tempDirUrl, item.dirName));
    }
    console.log("移动完成");
  }
  // 返回 批量移动/剪切本子( 使用新名字 )
  async batchMoveDirBreak(jsonFileUrl: string, tempDirUrl: string) {
    const tempDirUrlList = await fsPromises.readdir(tempDirUrl);
    const tempDirStr = tempDirUrlList.join();
    const files = await fsPromises.readFile(jsonFileUrl, "utf8");
    const fileJson: successItem[] = JSON.parse(files);
    for (let item of fileJson) {
      if (tempDirStr.includes(item.dirName)) {
        for (let tDirUrl of tempDirUrlList) {
          if (tDirUrl.includes(item.dirName)) {
            const newPath = item.dirUrl.replace(item.dirName, tDirUrl);
            await fsPromises.rename(path.join(tempDirUrl, tDirUrl), newPath);
          }
        }
      }
    }
    console.log("移动完成", tempDirUrlList.length, "条");
  }

  // 删除日期提升层级，还是从json里取
  async batchRemoveDateDir(jsonFileUrl: string, createDir: string) {
    const files = await fsPromises.readFile(jsonFileUrl, "utf8");
    console.log(typeof files);
    const fileJson: successItem[] = JSON.parse(files);

    let authorObjectList: authorType = {};
    fileJson.forEach((item) => {
      if (authorObjectList[item.author]) {
        authorObjectList[item.author]++;
      } else {
        authorObjectList[item.author] = 1;
      }
    });
    //  得先创作者空目录，不然会报错
    for (let key in authorObjectList) {
      try {
        await fsPromises.mkdir(path.join(createDir, key));
      } catch (err) {}
    }

    for (let item of fileJson) {
      try {
        await fsPromises.rename(item.dirUrl, item.dirUrl.replace(/[0-9]{2}-[0-9]{2}\\/, ''));
      } catch (error) {
        console.log(error)
      }
      

      // console.log(item.dirUrl.replace(/[0-9]{2}-[0-9]{2}\\/, ""));
    }
    console.log("提升完成");
  }
}

/**
 * 用于梳理菊姬的 作者归档
 * 挑出未汉化的，手动辨别之后，返回舱
 * 
 */

// 读取(查汉化) 2
const h1 = new HandleTempFile("./successDir.json");
h1.readJsonFile();

// 写入 1
// const t1 = new tool(`G:\\菊姬plus\\ftl\\06-05`);
// t1.play();

// t1.threeReadDir(1)

// 移动 3
// const h1 = new HandleTempFile("./");
// h1.batchMoveDir("./translatedGroupFalse.json", `G:\\菊姬plus\\未汉化检查\\`);

// 返回 4
// const h1 = new HandleTempFile("./");
// h1.batchMoveDirBreak(
//   "./translatedGroupFalse.json",
//   `G:\\菊姬plus\\未汉化检查\\`
// );

// 提升层级 5
// const h1 = new HandleTempFile("./");
// h1.batchRemoveDateDir("./successDir.json", "G:\\菊姬plus\\ftl");
