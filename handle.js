/*
 * @Author: forcier
 * @Date: 2020-06-28 12:08:12
 * @LastEditors: forcier
 * @LastEditTime: 2020-06-28 13:44:09
 * @Description: 将尺寸不符和下载失败的图片删除
 */

const fs = require('fs')
const path = require('path');
const images = require('images');

(async function () {
    let count = 0
    try {
        const dir = './wallpaper'
        const exists = await fs.existsSync(dir)
        !exists && process.exit(-1)

        const isDirectory = await fs.statSync(dir).isDirectory()
        !isDirectory && process.exit(-1)

        const destDirList = await fs.readdirSync(dir)
        destDirList.forEach(async v => {

            const destDir = path.join(dir, v)
            // const destDir = path.join('./wallpaper/四月是你的谎言')
            if (!fs.statSync(destDir).isDirectory())
                return null
            const imagesList = await fs.readdirSync(destDir)
            for (let i = imagesList.length; i--;) {
                const imagesPath = path.join(destDir, imagesList[i])
                let size
                try {
                    size = images(imagesPath).size()
                } catch (err) {
                    if(fs.statSync(imagesPath).size < 2<<20){
                        console.log(++count + '.', '删除坏图：', imagesPath)
                        fs.unlinkSync(imagesPath)
                    }
                    else
                        console.log(++count + '.', '图片过大，判断失败：', imagesPath)
                    continue
                }
                if (size.width / size.height < 1.48 || size.width / size.height > 2.1) {
                    console.log(++count + '.', '删除：', imagesPath)
                    fs.unlinkSync(imagesPath)
                } else {
                    console.log(++count + '.', '保留：', imagesPath)
                }
            }
        })

    } catch (error) {
        console.log(error)
    }
})()
