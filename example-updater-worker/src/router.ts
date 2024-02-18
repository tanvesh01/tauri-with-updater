import { Router } from 'itty-router';
import { Octokit } from 'octokit';
import { Env } from './index';

const router = Router();

const fetchGithubLatestRelease = async (env: Env) => {
	const octokit = new Octokit({
		auth: env.GITHUB_PERSONAL_TOKEN,
	});
	const res = await octokit.request('GET /repos/{owner}/{repo}/releases/latest', {
		owner: 'Project-wyda',
		repo: 'wyda',
		headers: {
			'X-GitHub-Api-Version': '2022-11-28',
		},
	});
	return res.data;
};

const PLATFORMS = {
	'windows-x86_64': 'x64_en-US.msi.zip',
};

// GET collection index
router.get('/api/check_update', async (request, env: Env) => {
	const latestRelease = await fetchGithubLatestRelease(env);

	let releaseReponse: {
		version: string;
		notes: string;
		pub_date: string;
		platforms: { [key: string]: { url: string; signature: string } };
	} = {
		version: latestRelease.tag_name,
		notes: latestRelease.body || '',
		pub_date: latestRelease.published_at || '',
		platforms: {
			'windows-x86_64': {
				signature: '',
				url: '',
			},
		},
	};
	let assetId: string = '';
	let msiURL = '';
	let downloadUrl = '';
	let zipAssetID: number = 0;
	console.log(latestRelease, 'assets');
	latestRelease.assets.map(async (asset) => {
		if (asset.name.includes('x64_en-US.msi.zip.sig')) {
			assetId = asset.url;
		} else if (asset.name.includes('x64_en-US.msi.zip')) {
			msiURL = asset.browser_download_url;
			downloadUrl = asset.url;
			zipAssetID = asset.id;
		}
	});

	const signatureText = await fetch(assetId, {
		method: 'GET',
		redirect: 'follow',
		headers: {
			'Content-Type': 'application/octet-stream',
			'User-Agent': env.GITHUB_USERNAME,
			'X-GitHub-Api-Version': '2022-11-28',
			Authorization: `Bearer ${env.GITHUB_PERSONAL_TOKEN}`,
			Accept: 'application/octet-stream',
		},
	});

	releaseReponse.platforms['windows-x86_64'].signature = await signatureText.text();
	releaseReponse.platforms['windows-x86_64'].url = `${env.DEPLOYED_WORKER_URL}/api/get_zip/` + zipAssetID;
	return new Response(JSON.stringify(releaseReponse));
});

router.get('/api/get_zip/:asset_id', async (request, env: Env) => {
	const assetId = request.params.asset_id;
	const downloadUrl = `https://api.github.com/repos/${env.REPO_TAG}/releases/assets/${assetId}`;

	const zipDownload = await fetch(downloadUrl, {
		method: 'GET',
		redirect: 'follow',
		headers: {
			'Content-Type': 'application/octet-stream',
			'User-Agent': env.GITHUB_USERNAME,
			'X-GitHub-Api-Version': '2022-11-28',
			Authorization: `Bearer ${env.GITHUB_PERSONAL_TOKEN}`,
			Accept: 'application/octet-stream',
		},
	});
	return zipDownload;
});

// 404 for everything else
router.all('*', () => new Response('Not Found.', { status: 404 }));

export default router;
