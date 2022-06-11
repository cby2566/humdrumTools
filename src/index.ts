const path = require("path");

import * as fsPromises from "fs/promises";
import { baseItem } from "./itemsType";

class tool {
  baseUrl: string;
  successDir: Array<baseItem>;
  failDirObj: Array<baseItem>;

  constructor(baseUrl: string = "./") {
    //
    this.baseUrl = baseUrl;

    this.successDir = []; // 文件名下面就是图的 列表

    this.failDirObj = []; //异常列表 - 数组对象形式
  }

  // Getter

  /**
   * 异常列表 仅名称数组
   */
  get failDir() {
    return this.failDirObj.map((item) => item.dirUrl);
  }

  withFileTypesObj = { withFileTypes: true };

  play(): void {
    console.log("正在启动");
  }

  /**
   * 读取当前目录的方法
   *
   * 至少给作者维度，不可给本子维度
   * @param url
   */
  async readCurrentDir(url: string = this.baseUrl) {
    console.log("输入的url", url);
    const files = await fsPromises.readdir(url, { withFileTypes: true });

    for (let file of files) {
      if (file.isDirectory()) {
        // 目录
        const dirName = file.name;
        const dirUrl: string = path.join(url, dirName);
        const dirBookFiles = await fsPromises.readdir(dirUrl, {
          withFileTypes: true,
        });
        // 根据路径查出有多少页 / 子文件夹
        const fileSize = dirBookFiles.length;

        // 判断此文件夹下，是否全部为图（文件）
        const isCaricature = dirBookFiles.every((file) => file.isFile());

        const author = path.basename(url)
        // 构建异常数组对象 item
        const failItem = {
          dirUrl,
          fileSize,
          dirName,
          author
        };
        if (isCaricature && dirName.includes('[')) {
          this.successDir.push({
            dirUrl,
            fileSize,
            dirName,
            author
          });
        } else {
          this.failDirObj.push(failItem);
        }
      } else {
        // 文件
      }
    }
    // failDirObj 打印于此
  }

  // 写入文件 txt 格式
  async writeFile(data: string, url: string) {
    const res = await fsPromises.writeFile(url, data);
    console.log("普通写入完成");
  }
  // 写入文件 json 格式
  async writeFileJson(data: string, url: string) {
    const res = await fsPromises.writeFile(url, data);
    console.log("json写入完成");
  }

  /**
   * 根据层级 梳理文件夹
   * 挑拣出非一层维度的文件夹
   * 挑拣出单行本
   * @param depth 
   */
  async threeReadDir(depth: number) {
    // 手动提升 n 次
    const url = this.baseUrl;
    const dirPathList = await this.normalRead(url, depth);
    for (let dirPath of dirPathList) {
      await this.readCurrentDir(dirPath);
    }
    console.log(`输入的URL: ${dirPathList.length} 条`)
    console.log(`共： ${this.failDir.length + this.successDir.length} 本`);
    console.log(`异常信息有： ${this.failDir.length} 条`);
    let tankArr = this.successDir.filter((item) => {
      return item.fileSize > 80;
    });
    console.log("其中单行本：", tankArr.length);
    this.writeFileJson(JSON.stringify(tankArr, null, "\t"), "./log/tankDir.json");

    // 写入数组，添加换行符写入
    this.writeFile(this.failDir.join("\n"), "./log/failDir.txt");

    // 写入异常数组对象，序列化  +++ 加二三参数使其在文件中也能格式化
    this.writeFileJson(
      JSON.stringify(this.failDirObj, null, "\t"),
      "./log/failDir.json"
    );

    // 写入完成数组
    this.writeFileJson(
      JSON.stringify(this.successDir, null, "\t"),
      "./successDir.json"
    );
  }
  /**
   * 根据给出的层级，返回一级维度的文件夹名字（如果减少维度，不会细分颗粒度，如：需要作者时）：normalRead(`G:\\菊姬plus\\ftl`, 2)
   * depth: 1
   * 作者名/漫画名/
   * eq: G:\\菊姬plus\\ftl\\01-13\\[かるま龍狼]  depth 1
   *
   * depth：2
   * 日期或分类名//作者名/漫画名
   * [かるま龍狼]/[かるま龍狼] おとなり/img
   * depth：3
   * 分类名/日期/作者名/漫画名
   * ftl/01-13/[かるま龍狼]/[かるま龍狼] おとなり/img
   * eq: G:\\菊姬plus\\ftl   depth 3
   *
   * @param url
   * @param depth
   * @returns { dirPath: string[] }
   */
  async normalRead(url: string, depth: number): Promise<string[]> {
    const files = await fsPromises.readdir(url, { withFileTypes: true });
    let dirPath: string[] = [];
    let fileSzie = 0;
    for (let file of files) {
      if (file.isDirectory()) {
        // 目录
        dirPath.push(path.join(url, file.name));
      } else {
        // 文件
        fileSzie++;
      }
    }
    if (!dirPath.length || files.length == fileSzie) {
      // 如果设置层级过甚
      console.log("depth: ", depth);
      console.error("层级错误", url);
      throw "error";
    }
    if (depth > 1) {
      depth = depth - 1;
      let childrenDirPathList: string[] = [];
      for (let depthFile of dirPath) {
        childrenDirPathList.push(...(await this.normalRead(depthFile, depth)));
      }
      return childrenDirPathList;
    } else {
      return dirPath;
    }
  }
}

// // const t1 = new tool(`G:/菊姬temp/20210314 题合集`);
// // const t1 = new tool(`Y:\\0核心漫画\\菊姬脉\\未梳理`);
// const t1 = new tool(`G:\\菊姬plus\\ftl`);
// t1.play();


// t1.threeReadDir(2)

export default tool;