/**
 * External dependencies
 */
const { App } = require( '@octokit/app' );
const axios = require( 'axios' );
require( 'dotenv' ).config();

const app = new App( {
	id: process.env.APP_ID,
	privateKey: process.env.PRIVATE_KEY,
} );

const getAppInstallToken = async ( owner, repo ) => {
	const install = await axios( {
		url: `https://api.github.com/repos/${ owner }/${ repo }/installation`,
		headers: {
			authorization: `Bearer ${ app.getSignedJsonWebToken() }`,
			accept: 'application/vnd.github.machine-man-preview+json',
		},
	} );

	if ( 200 !== install.status ) {
		throw new Error( 'Bad author username' );
	}

	const installationAccessToken = await app.getInstallationAccessToken( {
		installationId: install.data.id,
	} );

	return installationAccessToken;
};

module.exports = getAppInstallToken;
