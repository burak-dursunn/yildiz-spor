const puppeteer = require('puppeteer');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const URL = process.argv[2] || `file:///${path.resolve(__dirname, 'index.html').replace(/\\/g, '/')}`;
const DURATION = 15; // seconds
const FPS = 30;
const TOTAL_FRAMES = DURATION * FPS;
const OUTPUT_DIR = path.join(__dirname, 'output');
const TEMP_DIR = path.join(__dirname, 'temp_frames');

// linear easing function for constant speed
function linearEase(t) {
    return t;
}

async function run() {
    // Create necessary directories
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    if (!fs.existsSync(TEMP_DIR)) fs.mkdirSync(TEMP_DIR, { recursive: true });

    // Clean temp dir
    for (const file of fs.readdirSync(TEMP_DIR)) {
        fs.unlinkSync(path.join(TEMP_DIR, file));
    }

    console.log(`Starting Puppeteer renderer for URL: ${URL}`);

    const browser = await puppeteer.launch({
        headless: 'new',
        args: [
            '--hide-scrollbars',
            '--mute-audio',
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-gpu-shader-disk-cache',
            '--disable-threaded-animation',
            '--disable-threaded-scrolling'
        ],
        defaultViewport: {
            width: 1280,
            height: 720,
            deviceScaleFactor: 1,
        }
    });

    const page = await browser.newPage();

    // Hide mouse cursor and scrollbars aggressively
    await page.evaluateOnNewDocument(() => {
        const style = document.createElement('style');
        style.textContent = `
            * { cursor: none !important; }
            ::-webkit-scrollbar { display: none !important; }
        `;
        document.head.appendChild(style);
    });

    console.log('Loading page...');
    await page.goto(URL, { waitUntil: 'networkidle0' });

    console.log('Waiting for fonts and assets...');
    await page.evaluate(async () => {
        await document.fonts.ready;
        // Wait an extra 2 seconds for scripts like GSAP/Lenis/React to fully mount and initialize 3D assets
        await new Promise(resolve => setTimeout(resolve, 2000));
    });

    const bodyHeight = await page.evaluate(() => document.body.scrollHeight);
    const viewportHeight = 720;
    const maxScroll = Math.max(0, bodyHeight - viewportHeight);

    console.log(`Total scroll height: ${bodyHeight}. Max scroll: ${maxScroll}`);
    console.log(`Starting capture of ${TOTAL_FRAMES} frames (60 FPS, ${DURATION}s)...`);

    let prevY = 0;

    for (let frame = 0; frame < TOTAL_FRAMES; frame++) {
        const progress = frame / (TOTAL_FRAMES - 1);
        const easedProgress = linearEase(progress);
        const targetScrollY = easedProgress * maxScroll;

        // Calculate the discrete scroll delta for this frame
        const deltaY = targetScrollY - prevY;
        prevY = targetScrollY;

        // "Perform a REAL smooth browser scroll. Do NOT instantly set scrollTop."
        // We use the CDP / mouse wheel to simulate an exact physical mouse wheel tick.
        if (Math.abs(deltaY) > 0) {
            await page.mouse.wheel({ deltaY });
        }

        // "Synchronize every frame with requestAnimationFrame()."
        // "After every scroll increment wait until the browser has completed rendering before capturing the frame."
        await page.evaluate(() => {
            return new Promise((resolve) => {
                // Wait multiple rAF cycles:
                // 1. First rAF processes the physical scroll event.
                // 2. Second rAF allows Framer Motion / GSAP to read the new scroll pos and apply transforms.
                // 3. Third rAF ensures the layout and paint are finalized on screen.
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        requestAnimationFrame(() => {
                            resolve();
                        });
                    });
                });
            });
        });

        const frameNum = String(frame).padStart(4, '0');
        const framePath = path.join(TEMP_DIR, `frame_${frameNum}.png`);

        // Capture frame
        await page.screenshot({ path: framePath, type: 'png' });

        if (frame % 30 === 0) {
            console.log(`Captured frame ${frame}/${TOTAL_FRAMES}`);
        }
    }

    console.log('Finished capturing frames. Closing browser...');
    await browser.close();

    console.log('Starting FFmpeg compilation...');

    // Combine with FFmpeg
    // Requirements: H.264, CRF 23, 3 Mbps bitrate, yuv420p, 30 FPS, 1280x720
    const ffmpegArgs = [
        '-y',
        '-framerate', '30',
        '-i', path.join(TEMP_DIR, 'frame_%04d.png'),
        '-c:v', 'libx264',
        '-crf', '23',
        '-b:v', '3M',
        '-pix_fmt', 'yuv420p',
        '-s', '1280x720',
        path.join(OUTPUT_DIR, 'demo2.mp4')
    ];

    const ffmpeg = spawn('ffmpeg', ffmpegArgs);

    ffmpeg.stdout.on('data', (data) => {
        console.log(`ffmpeg: ${data}`);
    });

    ffmpeg.stderr.on('data', (data) => {
        console.log(`ffmpeg stderr: ${data}`);
    });

    ffmpeg.on('close', (code) => {
        if (code === 0) {
            console.log('Video generated successfully: /output/demo2.mp4');

            console.log('Cleaning up temporary PNG files...');
            for (const file of fs.readdirSync(TEMP_DIR)) {
                fs.unlinkSync(path.join(TEMP_DIR, file));
            }
            fs.rmdirSync(TEMP_DIR);

            console.log('Done.');
        } else {
            console.error(`FFmpeg exited with code ${code}`);
        }
    });
}

run().catch(console.error);
