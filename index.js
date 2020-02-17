/**
 * External dependencies
 */
const express = require( 'express' );
const path = require( 'path' );
const bodyParser = require( 'body-parser' );
const { Octokit } = require( '@octokit/rest' );
require( 'dotenv' ).config();

/**
 * Internal dependencies
 */
const getInstallationAccessToken = require( './server/auth' );

const repo = process.env.REPO;
const app = express();
const jsonParser = bodyParser.json();
const wrapAsync = fn => ( req, res, next ) => fn( req, res, next ).catch( next );

app.use( express.static( 'public' ) );

app.get( '/', ( request, response ) => {
	response.sendFile( path.resolve( __dirname, 'app', 'index.html' ) );
} );

app.post(
	'/api/issues',
	jsonParser,
	wrapAsync( async ( request, response ) => {
		const { author, title, assignees, body, labels } = request.body;
		const owner = author || process.env.ISSUE_AUTHOR;
		const token = await getInstallationAccessToken( owner, repo );
		const github = Octokit( {
			auth: token,
			userAgent: 'First Five 0.0.7',
		} );
		const issue = Object.assign(
			{},
			{
				owner,
				repo,
				title,
			},
			assignees && { assignees },
			body && { body },
			labels && { labels }
		);
		const newIssue = await github.issues.create( issue );
		response.send( {
			title,
			url: newIssue.data.html_url,
			assignees,
			issueId: newIssue.data.id,
			newIssue,
		} );
	} )
);

app.use( ( error, req, res, next ) => {
	res.json( { error: error.message } );
} );

app.listen( process.env.PORT || 8080, () =>
	console.log( `🚀  Server listening on port ${ process.env.PORT || 8080 }` )
);
