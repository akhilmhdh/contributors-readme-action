/**
 * Shard octokit client
 */
import { getOctokit } from '@actions/github';

// get repo token
const token = process.env['GITHUB_TOKEN'];

const octokit = getOctokit(token);

export default octokit;
