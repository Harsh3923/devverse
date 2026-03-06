export async function getGithubData(username) {
  try {
    const userRes = await fetch(`https://api.github.com/users/${username}`, {
      cache: "no-store",
    });

    const reposRes = await fetch(
      `https://api.github.com/users/${username}/repos?per_page=100`,
      {
        cache: "no-store",
      }
    );

    const user = await userRes.json();
    const repos = await reposRes.json();

    return {
      user,
      repos,
    };
  } catch (error) {
    return {
      user: null,
      repos: [],
      error: "Failed to fetch GitHub data",
    };
  }
}