/**
 * 附件选择 — 跨端 uni API
 */

function chooseImage(sourceType) {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count: 1,
      sizeType: ['compressed'],
      sourceType,
      success: (res) => {
        const path = res.tempFilePaths?.[0];
        if (path) {
          resolve(path);
        } else {
          reject(new Error('未选择图片'));
        }
      },
      fail: (err) => {
        if (err?.errMsg?.includes('cancel')) {
          reject(new Error('cancel'));
          return;
        }
        reject(err);
      },
    });
  });
}

/** 从相册选择图片 */
export function chooseImageFromAlbum() {
  return chooseImage(['album']);
}

/** 拍照 */
export function chooseImageFromCamera() {
  return chooseImage(['camera']);
}
