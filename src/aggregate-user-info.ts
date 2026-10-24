import * as client from './github-graphql';
import * as type from './type';

const OTHER_COLOR = '#444444';

const toNumberContributionLevel = (level: type.ContributionLevel): number => {
    switch (level) {
        case 'NONE':
            return 0;
        case 'FIRST_QUARTILE':
            return 1;
        case 'SECOND_QUARTILE':
            return 2;
        case 'THIRD_QUARTILE':
            return 3;
        case 'FOURTH_QUARTILE':
            return 4;
    }
};

const compare = (num1: number, num2: number): number => {
    if (num1 < num2) {
        return -1;
    } else if (num1 > num2) {
        return 1;
    } else {
        return 0;
    }
};

export const aggregateUserInfo = (
    response: client.ResponseType,
): type.UserInfo => {
    if (!response.data) {
        if (response.errors && response.errors.length) {
            throw new Error(response.errors[0].message);
        } else {
            throw new Error('JSON\n' + JSON.stringify(response, null, 2));
        }
    }

    const user = response.data.user;
    const calendar = user.contributionsCollection.contributionCalendar.weeks
        .flatMap((week) => week.contributionDays)
        .map((week) => ({
            contributionCount: week.contributionCount,
            contributionLevel: toNumberContributionLevel(
                week.contributionLevel,
            ),
            date: new Date(week.date),
        }));
    const repositoryLanguages: { [language: string]: type.LangInfo } = {};
    user.repositories.nodes.forEach((repo) => {
        repo.languages?.edges.forEach(({ size, node }) => {
            const info = repositoryLanguages[node.name];
            if (info) {
                info.size += size;
            } else {
                repositoryLanguages[node.name] = {
                    language: node.name,
                    color: node.color || OTHER_COLOR,
                    size,
                };
            }
        });
    });

    // Older API fixtures or cached responses may not include repository languages.
    // Keep a fallback for those responses; current GraphQL requests include languages.
    if (Object.keys(repositoryLanguages).length === 0) {
        user.contributionsCollection.commitContributionsByRepository
            .filter((repo) => repo.repository.primaryLanguage)
            .forEach((repo) => {
                const language = repo.repository.primaryLanguage?.name || '';
                const info = repositoryLanguages[language];
                if (info) {
                    info.size += repo.contributions.totalCount;
                } else {
                    repositoryLanguages[language] = {
                        language,
                        color:
                            repo.repository.primaryLanguage?.color || OTHER_COLOR,
                        size: repo.contributions.totalCount,
                    };
                }
            });
    }

    const languages: Array<type.LangInfo> = Object.values(
        repositoryLanguages,
    ).sort((obj1, obj2) => -compare(obj1.size, obj2.size));

    const totalForkCount = user.repositories.nodes
        .map((node) => node.forkCount)
        .reduce((num1, num2) => num1 + num2, 0);
    const totalStargazerCount = user.repositories.nodes
        .map((node) => node.stargazerCount)
        .reduce((num1, num2) => num1 + num2, 0);
    const userInfo: type.UserInfo = {
        isHalloween:
            user.contributionsCollection.contributionCalendar.isHalloween,
        contributionCalendar: calendar,
        repositoryLanguages: languages,
        totalContributions:
            user.contributionsCollection.contributionCalendar
                .totalContributions,
        totalCommitContributions:
            user.contributionsCollection.totalCommitContributions,
        totalIssueContributions:
            user.contributionsCollection.totalIssueContributions,
        totalPullRequestContributions:
            user.contributionsCollection.totalPullRequestContributions,
        totalPullRequestReviewContributions:
            user.contributionsCollection.totalPullRequestReviewContributions,
        totalRepositoryContributions:
            user.contributionsCollection.totalRepositoryContributions,
        totalForkCount: totalForkCount,
        totalStargazerCount: totalStargazerCount,
    };
    return userInfo;
};
