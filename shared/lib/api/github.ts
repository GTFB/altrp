import { Octokit } from '@octokit/rest';

export function createOctokit(accessToken?: string) {
  return new Octokit({
    auth: accessToken,
    userAgent: 'jambo-app',
  });
}
