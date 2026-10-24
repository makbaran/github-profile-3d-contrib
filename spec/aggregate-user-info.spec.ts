import * as aggregate from '../src/aggregate-user-info'
import * as type from '../src/type';
import { dummyData } from './dummy-data';

describe('github-graphql', () => {
    it('fetchData', () => {
        const userInfo = aggregate.aggregateUserInfo(dummyData);

        expect(userInfo.contributionCalendar.length).toEqual(371);

        const languages: Array<type.LangInfo> = [
            {
                "language": "Jupyter Notebook",
                "color": "#DA5B0B",
                "size": 108
            },
            {
                "language": "Perl",
                "color": "#0298c3",
                "size": 73
            },
            {
                "language": "Kotlin",
                "color": "#F18E33",
                "size": 58
            },
            {
                "language": "TypeScript",
                "color": "#2b7489",
                "size": 31
            },
            {
                "language": "Java",
                "color": "#b07219",
                "size": 28
            },
            {
                "language": "Go",
                "color": "#00ADD8",
                "size": 20
            },
            {
                "language": "Python",
                "color": "#3572A5",
                "size": 10
            },
            {
                "language": "JavaScript",
                "color": "#f1e05a",
                "size": 7
            },
            {
                "language": "C",
                "color": "#555555",
                "size": 4
            },
            {
                "language": "Ruby",
                "color": "#701516",
                "size": 1
            }
        ];
        expect(userInfo.repositoryLanguages).toEqual(languages);

        expect(userInfo.totalContributions).toEqual(366);
        expect(userInfo.totalCommitContributions).toEqual(344);
        expect(userInfo.totalIssueContributions).toEqual(4);
        expect(userInfo.totalPullRequestContributions).toEqual(12);
        expect(userInfo.totalPullRequestReviewContributions).toEqual(0);
        expect(userInfo.totalRepositoryContributions).toEqual(6);
        expect(userInfo.totalForkCount).toEqual(0);
        expect(userInfo.totalStargazerCount).toEqual(6);
    });
});
