import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";

let ffmpegInstance: FFmpeg | null = null;

async function loadFFmpeg() {
  if (ffmpegInstance) return ffmpegInstance;

  const ffmpeg = new FFmpeg();
  const baseURL = "https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd";

  await ffmpeg.load({
    coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
    wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
  });

  ffmpegInstance = ffmpeg;
  return ffmpeg;
}

export async function compressVideo(
  file: File,
  onProgress?: (progress: number) => void,
): Promise<File> {
  const ffmpeg = await loadFFmpeg();

  // Set up progress listener
  if (onProgress) {
    ffmpeg.on("progress", ({ progress }) => {
      onProgress(Math.round(progress * 100));
    });
  }

  // Write input file
  await ffmpeg.writeFile("input.mp4", await fetchFile(file));

  // Compress video
  // CRF: 23 is default, 28 is good compression, higher = smaller file
  // Scale: 1280:-2 means width 1280px, height auto-scaled to even number
  await ffmpeg.exec([
    "-i",
    "input.mp4",
    "-vcodec",
    "libx264",
    "-crf",
    "28",
    "-preset",
    "fast",
    "-vf",
    "scale=1280:-2",
    "-acodec",
    "aac",
    "-b:a",
    "128k",
    "output.mp4",
  ]);

  // Read compressed output
  const data = await ffmpeg.readFile("output.mp4");

  // Convert to File object - create a new Uint8Array to ensure proper ArrayBuffer type
  const uint8Data =
    typeof data === "string"
      ? new TextEncoder().encode(data)
      : new Uint8Array(data);

  const blob = new Blob([uint8Data], { type: "video/mp4" });
  return new File([blob], file.name, { type: "video/mp4" });
}
