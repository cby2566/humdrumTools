import * as fsPromises from "fs/promises";
import { baseItem } from "./itemsType";
import HandleTempFile from "./index";

class AdvancedTools extends HandleTempFile {
  // private baseUrl: string;
  private static failJsonUrl = "./log/failDir.json";
  private static successJsonUrl = "./log/successDir.json";
  private static translated: string[] = [
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
    "Pixiv",
  ];
  constructor(url: string) {
    super(url);
    this.baseUrl = url;
  }

  public async checkIndepentBK(jsonFile: string) {
    const files = await fsPromises.readFile(jsonFile, "utf8");
    const fileJson: baseItem[] = JSON.parse(files);

    console.log(`共${fileJson.length}条`);
    let noneSymbol: baseItem[] = [];
    let firstHan: baseItem[] = [];
    fileJson.forEach((tItem) => {
      if (tItem.dirName.search(/^\[/) === -1) {
        // 首位没有中括号
        noneSymbol.push(tItem);
      } else {
        const regs = new RegExp(/\[(.+?)\]/g);
        const searchAuthorList = tItem.dirName.match(regs) || [];
        if (searchAuthorList.length > 0) {
          if (
            AdvancedTools.translated.some((t) =>
              searchAuthorList[0].includes(t)
            )
          ) {
            // 首位是汉化组的
            firstHan.push(tItem);
          }
        } else {
        }
      }
    });

    console.log(`首位没有中括号的有 ${noneSymbol.length} 个`);
    console.log(`首位是汉化组的有 ${firstHan.length} 个`);
    this.writeFile(
      Array.prototype.concat(noneSymbol.map(i => i.dirUrl), ["分割"], firstHan.map(i => i.dirUrl)).join("\n"),
      "./log/failDir.txt"
    );
  }
  /**
   * 重写父类方法
   * @param depth  层级
   * 调整为同步执行
   */
  public async threeReadDir(depth: number) {
    // 手动提升 n 次
    const url = this.baseUrl;
    const dirPathList = await this.normalRead(url, depth);
    for (let dirPath of dirPathList) {
      await this.readCurrentDir(dirPath);
    }
    console.log(`输入的URL: ${dirPathList.length} 条`);
    console.log(`共： ${this.failDir.length + this.successDir.length} 本`);
    console.log(`异常信息有： ${this.failDir.length} 条`);
    // 写入JSON对象
    await Promise.all([
      this.writeFileJsonAll(this.failDirObj, AdvancedTools.failJsonUrl),
      this.writeFileJsonAll(this.successDir, AdvancedTools.successJsonUrl),
    ]);
  }
  /**
   * 合并请求
   * @param jsonObj
   * @param outputUrl
   */
  private async writeFileJsonAll(jsonObj: Array<baseItem>, outputUrl: string) {
    await this.writeFileJson(JSON.stringify(jsonObj, null, "\t"), outputUrl);
  }
}

const t1 = new AdvancedTools(`G:\\单行本\\2021`);
t1.play();
// t1.threeReadDir(2)
t1.checkIndepentBK("./log/successDir.json");
