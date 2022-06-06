import * as fsPromises from "fs/promises";
import HandleTempFile from "./index";
import { baseItem } from "./itemsType";

const path = require("path");

class Tankobon extends HandleTempFile {
  constructor(baseUrl: string) {
    super(baseUrl);
  }

  /**
   * 仅用于4K扫本，父目录名称缺失，且子目录是完整的
   *
   * @param errorJsonFileUrl  入参为异常信息JSON
   */
  async checkUp(errorJsonFileUrl: string) {
    const files = await fsPromises.readFile(errorJsonFileUrl, "utf8");
    console.log(typeof files);
    const fileJson: baseItem[] = JSON.parse(files);

    for (let bItem of fileJson) {
      const oneFile = await fsPromises.readdir(bItem.dirUrl);
      const newDirUrl = bItem.dirUrl.replace(bItem.dirName, oneFile[0]);
      console.log("旧：", path.join(bItem.dirUrl, oneFile[0]));
      console.log("新：", newDirUrl);
      await fsPromises.rename(path.join(bItem.dirUrl, oneFile[0]), newDirUrl);
      await fsPromises.rmdir(bItem.dirUrl);
    }
    console.log(`删除完成${fileJson.length}条`);
  }

  /**
   * 用于归档4K扫图组的目录
   * @param successJsonFileUrl 完成JSON路径
   */
  async collect4k(successJsonFileUrl: string) {
    const reg1 = "4K";
    const reg2 = "掃圖組";
    const files = await fsPromises.readFile(successJsonFileUrl, "utf8");
    const new4kUrl = path.join(this.baseUrl, "4K掃圖組");
    console.log(typeof files);
    const fileJson: baseItem[] = JSON.parse(files);
    const sao4k = fileJson.filter(
      (bitem) => bitem.dirName.includes(reg1) || bitem.dirName.includes(reg2)
    );

    await fsPromises.mkdir(new4kUrl).catch((err) => {
      console.log("创建文件失败", err);
    });
    for (let sItem of sao4k) {
      console.log(path.join(new4kUrl, sItem.dirName));
      await fsPromises.rename(sItem.dirUrl, path.join(new4kUrl, sItem.dirName));
    }
    console.log(`移动${sao4k.length}本， 完成`);
  }

  /**
   * 重写父类方法
   * @param depth  层级
   */
  async threeReadDir(depth: number) {
    // 手动提升 n 次
    const url = this.baseUrl;
    const dirPathList = await this.normalRead(url, depth);
    for (let dirPath of dirPathList) {
      await this.readCurrentDir(dirPath);
    }
    console.log(`输入的URL: ${dirPathList.length} 条`);
    console.log(`共： ${this.failDir.length + this.successDir.length} 本`);
    console.log(`异常信息有： ${this.failDir.length} 条`);

    // 写入数组，添加换行符写入文本
    this.writeFile(this.failDir.join("\n"), "./failDir.txt");

    // 写入异常数组对象
    this.writeFileJson(
      JSON.stringify(this.failDirObj, null, "\t"),
      "./failDir.json"
    );

    // 写入完成数组
    this.writeFileJson(
      JSON.stringify(this.successDir, null, "\t"),
      "./successDir.json"
    );
    const reg1 = "4K";
    const reg2 = "掃圖組";
    let you4k = 0;
    for (let item of this.successDir) {
      const files = await fsPromises.readdir(item.dirUrl);
      item.preview = files[0];
      if (item.dirName.includes(reg1) || item.dirName.includes(reg2)) you4k++;
    }
    console.log(`----4k扫图组有${you4k}本`)
    // 写入HTML预读json
    this.writeFileJson(
      `var successImg = ${JSON.stringify(this.successDir, null, "\t")}`,
      "./successImg.js"
    );
  }
}

// 实例运行
const t1 = new Tankobon(`G:\\单行本\\2019\\07`);
t1.play();
// 1 读取，并写入json
t1.threeReadDir(1);


// 2 处理4k父目录不全
// t1.checkUp("./failDir.json").then(() => {
//   console.log('刷新写入开始：：')
//   t1.threeReadDir(1);
// })


// 3 重命名 4k扫图组 
// t1.collect4k("./successDir.json");


// 但是有些其他分类里的，漫画名称不全，暂无法自动校验解决