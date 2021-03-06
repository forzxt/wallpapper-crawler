const fs = require('fs');
const axios = require('axios');
const cheerio = require('cheerio');
const download = require('download');
const path = require('path');

const keywords = process.argv[2];

process.on('uncaughtException', e => {
  console.log(e);
});

(async keywords => {
  try {
    let currentUrl;
    const PAGE_SIZE = 30;
    let pictureCount;
    const start_time = new Date();

    console.log('正在获取图片信息...');
    let res;
    let $;
    try {
      res = await axios.get(`https://wall.alphacoders.com/search.php?search=${encodeURI(keywords)}&lang=Chinese`, { timeout: 16666 });
    } catch {
      console.log('请求超时');
    }
    $ = cheerio.load(res.data);

    // 获取重定向之后的 url
    currentUrl = res.request._redirectable._currentUrl;

    // 获取图片总数
    pictureCount = parseInt($('#page_container > h1').text());
    pageCount = Math.ceil(pictureCount / PAGE_SIZE);
    if (isNaN(pictureCount)) {
      console.log('\n获取失败，请换个关键词试试^_^');
      process.exit(-1);
    }
    console.log(`共发现${pictureCount}张图片`);

    try {
      await fs.mkdirSync(path.join(__dirname, 'wallpaper'));
      console.log('\n创建目录 "wallpaper" 成功');
    } catch {
      console.log('\n目录 "wallpaper" 已存在');
    }

    try {
      await fs.mkdirSync(path.join(__dirname, 'wallpaper', keywords));
      console.log(`创建目录 "wallpaper\\${keywords}" 成功`);
    } catch {
      console.log(`目录 "wallpaper\\${keywords}" 已存在`);
    }

    console.log(`\n开始写入图片，目标路径 "${__dirname}\\wallpaper\\${keywords}\\"`);

    let downloadCount = 0;
    let sucCount = 0;

    for (let page = 1; page <= pageCount; page++) {
      if (page !== 1) {
        let res;
        try {
          // 获取当前页
          res = await axios.get(`${currentUrl}&page=${page}`, { timeout: 11111 });
        } catch{
          console.log('请求超时');
          downloadCount += PAGE_SIZE;
          continue;
        }
        $ = cheerio.load(res.data);
      }
      let urls = [];
      $('div.thumb-container > div.boxgrid > a > img').each((i, item) => {
        // console.log($(item).attr('src').replace(/thumb-[\d]{3}-/, ''))
        // process.exit(-1)
        urls.push(
          $(item)
            // .attr('data-src')
            .attr('src')
            .replace(/thumb-[\d]{3}-/, '')
        );
      });
      for (let i = urls.length; i--;) {
        const url = urls[i];
        const filename = url.replace(/https:\/\/images[\d]*.alphacoders.com\/[\d]{3}\//, '');

        // 下载图片
        download(url, path.join(__dirname, 'wallpaper', keywords)).then(() => {
          ++sucCount;
          console.log(`${++downloadCount} -- 图片 ${filename} 下载成功 √`);
          finish();
        }).catch(() => {
          console.log(`${++downloadCount} -- 图片 ${filename} 下载失败 ×`);
          finish();
        })
      }
    }

    // 判断下载结束
    function finish() {
      if (downloadCount === pictureCount) {
        const end_time = new Date();
        const time = (end_time - start_time) / 1000;
        console.log(`\n用时：${Math.floor(time / 3600)}:${Math.floor(time / 60) % 60}:${Math.floor(time) % 60}`);
        console.log(`结果：${sucCount}/${pictureCount}`);
        console.log(`成功率：${(sucCount / pictureCount) * 100}%`);
      }
    }
  } catch (err) {
    console.log(err);
  }
})(keywords);
