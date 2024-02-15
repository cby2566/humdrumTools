import * as fsPromises from "fs/promises";
import HandleTempFile from "./index";
import { baseItem } from "./itemsType";
/**
 * 用于整理new开头的本子合集，导出json文件
 * 其中掺杂了一些散本/系列合集/单行本
 * 
 */
class IndexNew extends HandleTempFile {

  constructor(baseUrl: string) {
    super(baseUrl);
  }

  async handleNewNumber(urlList: string[]) {

    for(let currentUrl of urlList){
      this.baseUrl = currentUrl
      await this.readCurrentDir()
    }


    console.log(`共： ${this.failDir.length + this.successDir.length} 本`);
    console.log(`正常的${this.successDir.length}本`);
    console.log(`异常信息有： ${this.failDir.length} 条`);
    console.log('正在异步写入JSON')

    // 写入异常数组对象，序列化  +++ 加二三参数使其在文件中也能格式化
    this.writeFileJson(
      JSON.stringify(this.failDirObj, null, "\t"),
      "./log/failDir.json"
    );

    // 写入完成数组
    this.writeFileJson(
      JSON.stringify(this.successDir, null, "\t"),
      "./log/successDir.json"
    );

    // 写入数组，添加换行符写入
    this.writeFile(this.failDir.join("\n"), "./log/failDir.txt");
  }
}


// const t1 = new IndexNew(`G:/BaiduNetdiskDownload/new本子_11`);
// const t1 = new IndexNew(`G:/BaiduNetdiskDownload/new本子_10`);
// const t1 = new IndexNew(`G:/BaiduNetdiskDownload/本子_new9`);
const t1 = new IndexNew(``);
// t1.baseUrl = `G:/BaiduNetdiskDownload/本子_new8`
// t1.baseUrl = `G:/BaiduNetdiskDownload/本子_new7`
// t1.baseUrl = `G:/BaiduNetdiskDownload/本子_new6` // 全是未来数位的，最后处理
// t1.baseUrl = `G:/BaiduNetdiskDownload/本子_new5`
// t1.baseUrl = `G:/BaiduNetdiskDownload/本子_new4`
// t1.baseUrl = `G:/BaiduNetdiskDownload/本子_new3`
// t1.baseUrl = `G:/BaiduNetdiskDownload/本子_new2` // 全是散本
// t1.baseUrl = `G:/BaiduNetdiskDownload/本子new`
let arrList = [
  'G:/BaiduNetdiskDownload/new本子_11',
  'G:/BaiduNetdiskDownload/new本子_10',
  'G:/BaiduNetdiskDownload/本子_new9',
  'G:/BaiduNetdiskDownload/本子_new8',
  'G:/BaiduNetdiskDownload/本子_new7',
  'G:/BaiduNetdiskDownload/本子_new5',
  'G:/BaiduNetdiskDownload/本子_new4',
  'G:/BaiduNetdiskDownload/本子_new3',
  'G:/BaiduNetdiskDownload/本子new',
]
t1.play();
t1.handleNewNumber(arrList);