import * as fsPromises from "fs/promises";
import { baseItem } from "./itemsType";
import HandleTempFile from "./index";

/**
 * 用于单行本，捕获那些首位名字 有问题的
 */
class AdvancedTools extends HandleTempFile {
  // private baseUrl: string;
  private static failJsonUrl = "./log/failDir.json";
  private static successJsonUrl = "./log/successDir.json";
  
  constructor(url: string) {
    super(url);
    this.baseUrl = url;
  }

  /**
   * 从完成梳理的json里读取，校验那些首位不是作者，或者混乱的name
   * @param jsonFile JSON的路径
   * @param inside 为true时第一位是汉化组的，不写入log日志直接返回[]
   * 
   * @returns 返回 baseItem[]
   */
  public async checkIndepentBK(jsonFile: string, inside?: boolean) {
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
          // AdvancedTools.translated
          if (
            HandleTempFile.translated.some((t) =>
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
    if(inside) {
      return firstHan
    }
    this.writeFile(
      Array.prototype.concat(noneSymbol.map(i => i.dirUrl), ["分割"], firstHan.map(i => i.dirUrl)).join("\n"),
      "./log/failDir.txt"
    );
  }
  /**
   * 从完成梳理的json里读取
   * 获取那些错误格式的
   * @param jsonFile 
   * 
   */
  public async handleName(jsonFile: string){
    const firstHan =  await this.checkIndepentBK(jsonFile, true);
    console.log('handleName', firstHan)
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
// t1.checkIndepentBK("./log/successDir.json");
t1.handleName("./log/successDir.json");
