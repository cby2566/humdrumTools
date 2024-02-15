import * as fsPromises from "fs/promises";
import { baseItem } from "./itemsType";
import HandleTempFile from "./index";

// 初步决定从2020年开始，摒弃小合集，按图源来决定是否保留。4k扫图组直接归到一起去算了。然后小型合集删一部分，如果可以的话丢到系列合集中或者记录名字后删了后续在重新下载最新的章节。
// 页数不足的从单行本的分类中移动到散本合集
// cg类的直接删除
// 未来数位的官方中文版可能需要用两个字段分别存他们的中文名和日文原名
// 黑条修正意味着把纯黑变成了半透明，还减小了打码面积

const obj = {
  dirUrl: '文件夹源地址', 
  fileSize: '文件数量',
  dirName: '文件夹名称',
  author: '作者名',
  preview: '暂时取的是首文件',
  series: '系列名称',
  localSources: '本地来源',
  uncensored: '是否无修',
  mangaId: '特有编号',

}
  

class HandleRepeat extends HandleTempFile{
  constructor(baseUrl: string) {
    super(baseUrl);
  }

}