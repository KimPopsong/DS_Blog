import puppeteer from 'puppeteer';
import { fileURLToPath } from 'url';
import { dirname, join, resolve } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { extname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const distDir = resolve(__dirname, '..', 'dist');
const resumeHtmlPath = join(distDir, 'resume', 'index.html');
const outputDir = resolve(__dirname, '..', 'public', 'resume');
const outputPdfPath = join(outputDir, '김대성_이력서.pdf');

// 간단한 로컬 서버 생성 함수
function createLocalServer(port = 3000) {
	return new Promise((resolve, reject) => {
		const server = createServer((req, res) => {
			let filePath = join(distDir, req.url === '/' ? 'index.html' : req.url);
			
			// resume 페이지로 리다이렉트
			if (req.url === '/') {
				filePath = resumeHtmlPath;
			} else if (req.url === '/resume' || req.url === '/resume/') {
				filePath = resumeHtmlPath;
			}
			
			// 파일 확장자에 따른 MIME 타입 설정
			const ext = extname(filePath);
			const mimeTypes = {
				'.html': 'text/html',
				'.css': 'text/css',
				'.js': 'application/javascript',
				'.jpg': 'image/jpeg',
				'.jpeg': 'image/jpeg',
				'.png': 'image/png',
				'.webp': 'image/webp',
				'.svg': 'image/svg+xml',
				'.woff': 'font/woff',
				'.woff2': 'font/woff2',
			};
			
			try {
				if (existsSync(filePath)) {
					const content = readFileSync(filePath);
					res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
					res.end(content);
				} else {
					// 상대 경로로 다시 시도
					const relativePath = req.url.startsWith('/') ? req.url.slice(1) : req.url;
					const altPath = join(distDir, relativePath);
					if (existsSync(altPath)) {
						const content = readFileSync(altPath);
						res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
						res.end(content);
					} else {
						res.writeHead(404, { 'Content-Type': 'text/plain' });
						res.end('404 Not Found');
					}
				}
			} catch (error) {
				res.writeHead(500, { 'Content-Type': 'text/plain' });
				res.end('Internal Server Error');
			}
		});

		server.listen(port, '127.0.0.1', () => {
			console.log(`🌐 로컬 서버 시작: http://127.0.0.1:${port}/resume/`);
			resolve(server);
		});

		server.on('error', (error) => {
			if (error.code === 'EADDRINUSE') {
				// 포트가 사용 중이면 다른 포트 시도
				console.log(`포트 ${port}이 사용 중입니다. 다른 포트를 시도합니다...`);
				server.close();
				createLocalServer(port + 1).then(resolve).catch(reject);
			} else {
				reject(error);
			}
		});
	});
}

async function generateResumePDF() {
	let server = null;
	let serverPort = 3000;
	
	try {
		// 빌드된 HTML 파일이 있는지 확인
		if (!existsSync(resumeHtmlPath)) {
			console.error(`❌ Resume HTML 파일을 찾을 수 없습니다: ${resumeHtmlPath}`);
			console.error('먼저 "npm run build"를 실행해주세요.');
			process.exit(1);
		}

		console.log('📄 Resume PDF 생성 시작...');

		// 출력 디렉토리 생성
		if (!existsSync(outputDir)) {
			mkdirSync(outputDir, { recursive: true });
		}

		// 로컬 서버 시작 (리소스 로딩을 위해)
		server = await createLocalServer(serverPort);
		if (server && server.address()) {
			serverPort = server.address().port;
		}

		// Puppeteer로 브라우저 실행
		const browser = await puppeteer.launch({
			headless: true,
			args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-web-security']
		});

		const page = await browser.newPage();

		// 페이지 크기 설정 (resume 페이지의 max-width 반영)
		await page.setViewport({
			width: 1000,
			height: 1200,
			deviceScaleFactor: 2
		});

		// 로컬 서버의 resume 페이지 접근
		const url = `http://127.0.0.1:${serverPort}/resume/`;
		await page.goto(url, {
			waitUntil: 'networkidle0',
			timeout: 30000
		});

		// 추가 대기 (동적 콘텐츠 로딩 완료를 위해)
		await new Promise(resolve => setTimeout(resolve, 2000));

		// 프로젝트 카드들이 제대로 렌더링되었는지 확인
		const projectsLoaded = await page.evaluate(() => {
			const container = document.querySelector('.projects-container');
			if (!container) return false;
			const cards = container.querySelectorAll('.project-card');
			return cards.length > 0;
		});

		if (!projectsLoaded) {
			console.warn('⚠️ 프로젝트 카드가 로드되지 않았을 수 있습니다. 추가 대기 중...');
			await new Promise(resolve => setTimeout(resolve, 2000));
		}

		// PDF 생성 옵션 설정
		await page.pdf({
			path: outputPdfPath,
			format: 'A4',
			printBackground: true,
			margin: {
				top: '15mm',
				right: '15mm',
				bottom: '15mm',
				left: '15mm'
			},
			preferCSSPageSize: false,
			displayHeaderFooter: false
		});

		await browser.close();
		
		if (server) {
			server.close();
		}

		console.log(`✅ Resume PDF 생성 완료: ${outputPdfPath}`);
	} catch (error) {
		console.error('❌ PDF 생성 중 오류 발생:', error);
		if (server) {
			server.close();
		}
		process.exit(1);
	}
}

generateResumePDF();

