/**
 * Shard octokit client
 */
import * as github from '@actions/github';

// get repo token
const token = process.env['GITHUB_TOKEN'];

const octokit = github.getOctokit(token);

export default octokit;
