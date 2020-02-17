/**
 * External dependencies
 */
import React, { Fragment, useState, useEffect, useRef } from 'react';
import axios from 'axios';

/**
 * Internal dependencies
 */
import './style.scss';

const getFromCommaList = list =>
	list.split( ',' ).reduce( ( acc, curr ) => {
		const x = curr.trim();
		return x ? [ ...acc, x ] : acc;
	}, [] );

const useField = () => {
	const [ value, setValue ] = useState( '' );
	return { value, onChange: x => setValue( 'string' === typeof x ? x : x.target.value ) };
};

export default function App() {
	const [ newIssues, setNewIssues ] = useState( [] );
	const issues = useField();
	const author = useField();
	const [ issueList, setIssueList ] = useState( [] );
	const [ creating, setCreating ] = useState( false );
	const [ error, setError ] = useState( '' );
	const newIssuesOk = useRef( newIssues );
	newIssuesOk.current = newIssues;

	useEffect( () => {
		if ( 0 < issueList.length ) {
			const timer = setTimeout( processIssue, 1500 );
			return () => clearTimeout( timer );
		} else if ( creating ) {
			setCreating( false );
		}
	}, [ issueList ] );

	const fetchData = issue => {
		const parsedIssue = issue.split( '|' );
		const requestBody = Object.assign(
			{},
			{
				author: author.value,
				title: parsedIssue[ 0 ],
			},
			parsedIssue[ 1 ] &&
				'' !== parsedIssue[ 1 ] && { assignees: getFromCommaList( parsedIssue[ 1 ] ) },
			parsedIssue[ 2 ] && '' !== parsedIssue[ 2 ] && { body: parsedIssue[ 2 ] },
			parsedIssue[ 3 ] &&
				'' !== parsedIssue[ 3 ] && { labels: getFromCommaList( parsedIssue[ 3 ] ) }
		);

		return axios( {
			method: 'post',
			url: '/api/issues',
			data: requestBody,
		} );
	};

	const processIssue = async () => {
		const result = await fetchData( issueList[ 0 ] );
		if ( result.data.error ) {
			setError( result.data.error );
			setNewIssues( [] );
			setCreating( false );
		} else {
			setNewIssues( [ ...newIssuesOk.current, result.data ] );
			const newIssueList = issueList.slice( 1 );
			setIssueList( newIssueList );
			issues.onChange( newIssueList.join( '\n' ) );
		}
	};

	const handleClick = e => {
		e.preventDefault();
		setError( '' );
		setCreating( true );
		setNewIssues( [] );
		newIssuesOk.current = [];
		setIssueList( issues.value.split( '\n' ).filter( x => '' !== x ) );
	};

	return (
		<Fragment>
			<h1>Create GitHub Issues</h1>
			<form className="issue-creator">
				<p>
					<label htmlFor="author">Author</label>
					<input
						{ ...author }
						id="author"
						type="text"
						disabled={ creating }
						placeholder="Your GitHub username"
					/>
				</p>
				<label htmlFor="issues">Issues</label>
				<div className="issue-creator__issues">
					{ creating && <div className="issue-creator__block"></div> }
					<textarea
						{ ...issues }
						id="issues"
						disabled={ creating }
						placeholder="Issue title | assignee | Description of the issue. | label"
					/>
					<p className="issue-creator__issues-help">
						Write issues, one on each line. A GitHub issue will be created for each line. Separate
						with a pipe and type a comma-separated list of usernames to assign the issue to. Another
						pipe separates the description, and a final one expresses a comma-separated list of
						tags.
					</p>
				</div>
				<p>
					<button
						onClick={ handleClick }
						disabled={ '' === author.value || '' === issues.value || creating }
					>
						Go!
					</button>
				</p>
				{ error && <p className="issue-creator__error">{ error }</p> }
			</form>
			{ 0 < newIssues.length && (
				<div className="new-issues">
					<h2>New issues created</h2>
					<ul>
						{ newIssues.map( newIssue => (
							<li key={ newIssue.issueId }>
								<a href={ newIssue.url }>{ newIssue.title }</a>
							</li>
						) ) }
					</ul>
				</div>
			) }
		</Fragment>
	);
}
