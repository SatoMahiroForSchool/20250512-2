let facemesh;
let handpose;
let video;
let predictions = [];
let handPredictions = [];

const lipsIndices = [
  409, 270, 269, 267, 0, 37, 39, 40, 185, 61, 146, 91, 181, 84, 17, 314, 405, 321, 375, 291,
  76, 77, 90, 180, 85, 16, 315, 404, 320, 307, 306, 408, 304, 303, 302, 11, 72, 73, 74, 184
];
const leftEyeIndices = [
  243, 190, 56, 28, 27, 29, 30, 247, 130, 25, 110, 24, 23, 22, 26, 112,
  133, 173, 157, 158, 159, 160, 161, 246, 33, 7, 163, 144, 145, 153, 154, 155
];
const rightEyeIndices = [
  359, 467, 260, 259, 257, 258, 286, 444, 463, 341, 256, 252, 253, 254, 339, 255,
  263, 466, 388, 387, 386, 385, 384, 398, 362, 382, 381, 380, 374, 373, 390, 249
];

function setup() {
  createCanvas(640, 480);

  // 嘗試啟用攝像頭，並處理可能的錯誤
  try {
    video = createCapture(VIDEO);
    video.size(width, height);
    video.hide();
  } catch (error) {
    console.error("Error accessing video device:", error);
    noLoop(); // 停止 draw 迴圈
    return;
  }

  // 加載 facemesh 模型
  try {
    facemesh = ml5.facemesh(video, () => console.log("Facemesh model loaded!"));
    facemesh.on("predict", results => {
      predictions = results;
    });
  } catch (error) {
    console.error("Error loading facemesh model:", error);
  }

  // 加載 handpose 模型
  try {
    handpose = ml5.handpose(video, () => console.log("Handpose model loaded!"));
    handpose.on("predict", results => {
      handPredictions = results;
    });
  } catch (error) {
    console.error("Error loading handpose model:", error);
  }
}

function draw() {
  if (!video) return; // 如果攝像頭未啟用，停止繪製

  image(video, 0, 0, width, height);

  noFill();
  strokeWeight(3); // 將線條粗細改為 3

  // 檢查 predictions 是否有數據
  if (predictions.length > 0) {
    console.log(predictions); // 除錯：檢查 predictions 的內容
    const keypoints = predictions[0].scaledMesh;

    // 繪製嘴唇（紅色）
    stroke(255, 0, 0); // 紅色
    drawConnections(keypoints, lipsIndices);

    // 繪製左眼（藍色）
    stroke(0, 0, 255); // 藍色
    drawConnections(keypoints, leftEyeIndices);

    // 繪製右眼（綠色）
    stroke(0, 255, 0); // 綠色
    drawConnections(keypoints, rightEyeIndices);
  }

  // 繪製 handpose 的食指指尖
  if (handPredictions.length > 0) {
    for (let i = 0; i < handPredictions.length; i++) {
      const landmarks = handPredictions[i].landmarks;

      // 食指指尖的索引是 8
      const indexFingerTip = landmarks[8];

      // 繪製白點
      fill(255);
      noStroke();
      ellipse(indexFingerTip[0], indexFingerTip[1], 10, 10);
    }
  }
}

function drawConnections(keypoints, indices) {
  for (let i = 0; i < indices.length - 1; i++) {
    const start = keypoints[indices[i]];
    const end = keypoints[indices[i + 1]];
    if (start && end) {
      line(start[0], start[1], end[0], end[1]);
    }
  }
}
