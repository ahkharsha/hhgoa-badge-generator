import smartcrop from 'smartcrop';
import { createCanvas, loadImage } from 'canvas';
async function test() {
    const img = await loadImage('public/assets/images/hackers.png');
    const result = await smartcrop.crop(img, { width: 500, height: 500 });
    console.log(result.topCrop);
}
test();
