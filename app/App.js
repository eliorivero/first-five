/**
 * External dependencies
 */
import React, { Fragment, useState } from 'react';
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
	const repo = useField();
	const [ isAddMode, setIsAddMode ] = useState( true );
	const [ creating, setCreating ] = useState( false );
	const [ error, setError ] = useState( '' );

	const parseIssue = issue => {
		const parsedIssue = issue.split( '|' );
		return Object.assign(
			{},
			{
				title: parsedIssue[ 0 ],
			},
			parsedIssue[ 1 ] &&
				'' !== parsedIssue[ 1 ] && { assignees: getFromCommaList( parsedIssue[ 1 ] ) },
			parsedIssue[ 2 ] && '' !== parsedIssue[ 2 ] && { body: parsedIssue[ 2 ] },
			parsedIssue[ 3 ] &&
				'' !== parsedIssue[ 3 ] && { labels: getFromCommaList( parsedIssue[ 3 ] ) }
		);
	};

	const processIssues = async data => {
		const result = await axios( {
			method: 'post',
			url: '/api/issues',
			data,
		} );

		if ( result.data.error ) {
			setError( result.data.error );
			setNewIssues( [] );
		} else {
			issues.onChange( '' );
			setNewIssues( result.data );
		}
		setCreating( false );
	};

	const switchMode = () => {
		setIsAddMode( ! isAddMode );
	};

	const handleClick = () => {
		setError( '' );
		setCreating( true );
		switchMode();
		setNewIssues( [] );
		processIssues( {
			repo: repo.value,
			issues: issues.value
				.split( '\n' )
				.filter( x => '' !== x )
				.map( parseIssue ),
		} );
	};

	const handleSwitchMode = () => switchMode();

	return isAddMode ? (
		<Fragment>
			<h1>Create GitHub Issues</h1>
			<form className="issue-creator">
				<p>
					<label htmlFor="repo">Repository Pass</label>
					<input
						{ ...repo }
						id="repo"
						type="text"
						disabled={ creating }
						placeholder="Pass for GitHub repository"
					/>
				</p>
				<label htmlFor="issues">Issues</label>
				<div className="issue-creator__issues">
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
					<button onClick={ handleClick } disabled={ '' === issues.value || creating }>
						Go!
					</button>
				</p>
			</form>
		</Fragment>
	) : (
		<Fragment>
			<h2>New issues created</h2>
			{ creating && <div className="issue-creator__block">Creating issues…</div> }
			{ 0 < newIssues.length && (
				<div className="new-issues">
					<ul>
						{ newIssues.map( newIssue => (
							<li key={ newIssue.issueId }>
								<a href={ newIssue.url }>{ newIssue.title }</a>
							</li>
						) ) }
					</ul>
				</div>
			) }
			{ error && <p className="issue-creator__error">{ error }</p> }
			{ ! creating && (
				<button onClick={ handleSwitchMode }>{ error ? 'Try again' : 'Add more' }</button>
			) }
		</Fragment>
	);
}
