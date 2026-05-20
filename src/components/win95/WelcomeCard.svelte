<script lang="ts">
  import { onMount } from "svelte";

  const GITHUB_USER = "137-Trimethylxanthin";

  let stats = $state({
    repos: 21,
    followers: 8,
    stars: 0,
    following: 19,
  });

  onMount(() => {
    Promise.all([
      fetch(`https://api.github.com/users/${GITHUB_USER}`, {
        headers: { "User-Agent": "Maxi-Homepage" },
      }),
      fetch(`https://api.github.com/users/${GITHUB_USER}/repos?per_page=100`, {
        headers: { "User-Agent": "Maxi-Homepage" },
      }),
    ])
      .then(async ([userRes, reposRes]) => {
        const userData = userRes.ok ? await userRes.json() : null;
        const reposData = reposRes.ok ? await reposRes.json() : [];

        if (userData) {
          stats.repos = userData.public_repos ?? stats.repos;
          stats.followers = userData.followers ?? stats.followers;
          stats.following = userData.following ?? stats.following;
        }

        const ownRepos = reposData.filter((r: any) => !r.fork);
        stats.stars = ownRepos.reduce((sum: number, r: any) => sum + (r.stargazers_count || 0), 0);
      })
      .catch(() => {
        // Keep fallback stats
      });
  });
</script>

<div class="welcome-card"
  style="
    font-family: M95, W95FA, 'MS Sans Serif', 'Segoe UI', sans-serif;
    font-size: 11px;
    padding: 16px;
    background: #c0c0c0;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
  ">
  <div style="display:flex;align-items:flex-start;gap:12px;margin-bottom:12px;">
    <div style="flex-shrink:0;width:48px;height:48px;display:flex;align-items:center;justify-content:center;background:#000080;border:2px outset #fff;">
      <span style="color:#fff;font-family:ThiccWin95,W95FA,sans-serif;font-size:28px;">M</span>
    </div>
    <div>
      <div style="font-family:ThiccWin95,W95FA,sans-serif;font-size:13px;font-weight:bold;color:#000080;margin-bottom:2px;">
        Welcome to Maxi's Windows 95 Desktop
      </div>
    </div>
  </div>

  <div style="
    border:2px inset #fff;
    background:#fff;
    padding:12px;
    flex:1;
    overflow:auto;
    font-size:11px;
    line-height:1.6;
  ">
    <p style="margin:0 0 8px;">
      <strong>Name:</strong> Maxi<br/>
      <strong>Location:</strong> Villach, Austria<br/>
      <strong>Company:</strong> HTBLuVA Villach & FlyBy-Guys<br/>
      <strong>Bio:</strong> Hello 👋 I'm Maxi and these are my code projects.
    </p>

    <div style="
      border:1px solid #808080;
      margin:8px 0;
      padding:8px;
      background:#f0f0f0;
    ">
      <div style="font-weight:bold;margin-bottom:4px;font-size:12px;">GitHub Stats</div>
      <table border="0" cellpadding="2" cellspacing="4" style="width:100%;text-align:center;">
        <tbody>
          <tr>
            <td style="border:1px solid #808080;background:#fff;padding:4px 8px;">
              <div style="font-size:16px;font-weight:bold;color:#000080;">{stats.repos}</div>
              <div style="font-size:9px;">Repos</div>
            </td>
            <td style="border:1px solid #808080;background:#fff;padding:4px 8px;">
              <div style="font-size:16px;font-weight:bold;color:#008000;">{stats.followers}</div>
              <div style="font-size:9px;">Followers</div>
            </td>
            <td style="border:1px solid #808080;background:#fff;padding:4px 8px;">
              <div style="font-size:16px;font-weight:bold;color:#800000;">{stats.stars}</div>
              <div style="font-size:9px;">Stars</div>
            </td>
            <td style="border:1px solid #808080;background:#fff;padding:4px 8px;">
              <div style="font-size:16px;font-weight:bold;">{stats.following}</div>
              <div style="font-size:9px;">Following</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p style="margin:8px 0 0;">
      Click <strong>Start</strong> to explore programs and settings.<br/><br/>
      Use <strong>Internet Explorer</strong> on the desktop to browse Maxi's homepage and the World Wide Web.<br/><br/>
      Double-click <strong>My Computer</strong> to explore your files.
    </p>
  </div>

  <div style="text-align:center;margin-top:8px;font-size:10px;color:#808080;">
    Windows 95 Desktop v1.0 &bull; &copy; 1995-2026 Maxi
  </div>
</div>
