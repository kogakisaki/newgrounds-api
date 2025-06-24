import { SearchOptions, AudioSearchResult } from "../interfaces/search.js";
import { Audio } from "./Audio.js";
import { BaseOptions } from "../interfaces/baseOptions.js";
import { convertTimeFormatToSeconds, convertHtmlToMarkdown } from "../utils/index.js";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";
import { Playlist } from "./Playlist.js";

/**
 * Represents the Newgrounds API
 * @class Newgrounds
 */
export class Newgrounds {
  readonly options: BaseOptions;
  readonly puppeteer: typeof puppeteer;
  constructor() {
    this.options = {
      ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:138.0) Gecko/20100101 Firefox/138.0",
    };
    this.puppeteer = puppeteer;
  }

  /**
   * Search for audio on Newgrounds
   * @param {string} terms The search terms
   * @param {SearchOptions} options The search options
   * @returns {Promise<AudioSearchResult[]>}
   */
  async searchAudio(
    terms: string,
    options: SearchOptions = {
      page: 1,
      sort_by: "relevance",
    }
  ): Promise<AudioSearchResult[]> {
    const url = `https://www.newgrounds.com/search/conduct/audio?terms=${encodeURIComponent(
      terms
    )}&page=${options.page}&sort=${options.sort_by}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": this.options.ua,
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch audio search results: ${response.status} ${response.statusText}`
      );
    }

    const $ = cheerio.load(await response.text());

    const searchResults = $(".audio-wrapper");

    let res: AudioSearchResult[] = [];

    searchResults.each((i, el) => {
      const mainAnchor = $(el).find(".item-audiosubmission");

      const title = mainAnchor.attr("title") ?? "";
      const link = mainAnchor.attr("href")?.trim() ?? "";
      const id = link.substring(link.lastIndexOf("/") + 1);
      const thumbnail = mainAnchor.find(".item-icon img").attr("src") ?? "";

      const artist = mainAnchor.find(".detail-title").find("strong").text().trim();
      const short_description = mainAnchor.find(".detail-description").text().trim();

      const metaSection = mainAnchor.find(".item-details-meta");

      const scoreText = metaSection.find(".star-score").attr("title");
      let score: number | null = null;
      if (scoreText) {
        const parts = scoreText.split(" ");
        if (parts.length > 1) {
          const scoreValue = parts[1].split("/")[0];
          if (!isNaN(parseFloat(scoreValue))) {
            score = parseFloat(scoreValue);
          }
        }
      }

      const ddElements = metaSection.find("dl dd");

      let type: string | undefined;
      let genre: string | undefined;
      let views: number | null = null;

      if (ddElements.length === 1) {
        const viewsText = ddElements.text();
        views = viewsText ? Number(viewsText.split(",").join("").replace(" Views", "")) : null;
      } else if (ddElements.length === 2) {
        const viewsText = ddElements.eq(1).text();
        views = viewsText ? Number(viewsText.split(",").join("").replace(" Views", "")) : null;
      } else if (ddElements.length >= 3) {
        type = ddElements.eq(0).text();
        genre = ddElements.eq(1).text();
        const viewsText = ddElements.eq(2).text();
        views = viewsText ? Number(viewsText.split(",").join("").replace(" Views", "")) : null;
      }

      res.push({
        title: title,
        link: link,
        id: id,
        thumbnail: thumbnail,
        artist: artist,
        short_description: short_description,
        score: score,
        type: type,
        genre: genre,
        views: views,
      });
    });
    return res;
  }

  /**
   * Get details of an audio.
   * @param {string} id audio id
   * @returns {Promise<Audio>}
   */
  async getAudio(id: string): Promise<Audio> {
    const $ = cheerio.load(
      await (await fetch(`https://www.newgrounds.com/audio/listen/${id}`)).text()
    );

    const url = `https://www.newgrounds.com/audio/listen/${id}`;
    const icon = $("meta[property='og:image']").attr("content");
    const title = $("meta[property='og:title']").attr("content");
    const caption = $("meta[property='og:description']").attr("content");

    const credits = {
      artist: $(".authorlinks .item-details-main h4 a").text(),
      url: $(".authorlinks .item-details-main h4 a").attr("href"),
      icon: $(".authorlinks .user-icon-bordered image").attr("href"),
    };

    const info: {
      [key: string]: any;
    } = {};

    $("dl.sidestats").each((_dlIndex, dlElement) => {
      const $dl = $(dlElement);
      $dl.find("dt").each((_dtIndex, dtElement) => {
        const infoKey = $(dtElement)
          .text()
          .toLowerCase()
          .replace(/\s/g, "_")
          .replace(":", "")
          .trim();
        const values: string[] = [];
        let currentSibling = $(dtElement).next();
        while (
          currentSibling.length > 0 &&
          !currentSibling.is("dt") &&
          currentSibling.parent().is($dl)
        ) {
          if (currentSibling.is("dd")) {
            const clonedDd = currentSibling.clone();
            clonedDd.find("script").remove();
            clonedDd.find("br").replaceWith(" ");
            clonedDd.find("a").each((_k, aEl) => {
              $(aEl).replaceWith($(aEl).text());
            });
            clonedDd.find("span").each((_k, spanEl) => {
              $(spanEl).replaceWith($(spanEl).text());
            });
            clonedDd.find("ul li").each((_k, liEl) => {
              const liText = $(liEl).text().trim().replace(/\s+/g, " ");
              if (liText) {
                values.push(liText);
              }
            });

            let value = clonedDd.text().trim();
            value = value.replace(/\s+/g, " ").trim();
            if (!clonedDd.hasClass("tags") && value) {
              values.push(value);
            }
          }
          currentSibling = currentSibling.next();
        }
        if (infoKey === "tags" && values.length > 0) {
          info[infoKey] = values.join(", ");
        } else if (values.length > 1) {
          info[infoKey] = values;
        } else if (values.length === 1) {
          info[infoKey] = values[0];
        } else {
          info[infoKey] = undefined;
        }
      });
    });
    if (info.listens) {
      info.listens = Number(info.listens.replace(/,/g, ""));
    }
    if (info.faves) {
      info.faves = {
        count: Number(info.faves.replace(/,/g, "")),
        view_url: $("#faves_load").attr("href"),
      };
    }
    if (info.downloads) {
      info.downloads = Number(info.downloads.replace(/,/g, ""));
    }
    if (info.votes) {
      info.votes = Number(info.votes.replace(/,/g, ""));
    }
    if (info.score && info.score.includes("/")) {
      info.score = Number(info.score.split("/")[0]);
    }
    if (info.uploaded) {
      info.uploaded = new Date(info.uploaded.join(" ")).toISOString();
    }
    if (info.genre) {
      info.genre = {
        id: new URL($(".sidestats.flex-1 dd a").attr("href") || "").searchParams.get("genre"),
        name: info.genre,
        browse_url: $(".sidestats.flex-1 dd a").attr("href"),
      };
    }
    if (info.file_info) {
      info.file_info = {
        type: info.file_info[0],
        size: info.file_info[1],
        duration: convertTimeFormatToSeconds(info.file_info[2]),
      };
    }
    if (info.tags) {
      info.tags = info.tags.split(", ");
    }
    info.frontpaged =
      $(".frontpage a").length !== 0
        ? {
            time: new Date($(".frontpage a").text().trim()).toISOString(),
            url: `https://www.newgrounds.com${$(".frontpage a").attr("href")}`,
          }
        : undefined;
    const appearances = {
      label: $("ul.itemlist.alternating > li > span").text(),
      url: $("ul.itemlist.alternating > li > span > a").attr("href"),
    };
    const related: any[] = [];
    $("div.pod-body.audio-view > ul > li").each((i, e) => {
      const $e = $(e);
      const url = $e.find("a.item-link").attr("href");
      const id = url?.substring(url?.lastIndexOf("/") + 1);
      const title = $e.find("a.item-link > h4 > span").eq(0).text().trim();
      const artist = $e.find("a.item-link > h4 span strong").text().trim();
      related.push({
        id: id,
        title: title,
        url: url,
        artist: artist,
      });
    });
    const licensing_terms = convertHtmlToMarkdown(
      $("div#creative_commons .pod-body.creative-commons").html() ?? ""
    );
    const audio = {
      rating: $("div[itemprop='itemReviewed'] > h2").attr("class")?.split("-")[1].toUpperCase(),
      download_url: $("a.icon-download").attr("href"),
      file_url: $("meta[property='og:audio']").attr("content"),
      share_url: $("a.icon-share").attr("href"),
    };
    const author_comments = convertHtmlToMarkdown($("div#author_comments").html() ?? "");
    const reviews = Boolean($("div > div .pod-body.review"));

    return new Audio(this, {
      id: id,
      title: title,
      caption: caption,
      url: url,
      icon: icon,
      credits: credits,
      info: {
        listens: info.listens,
        faves: info.faves,
        downloads: info.downloads,
        votes: info.votes,
        score: info.score,
        uploaded: info.uploaded,
        genre: info.genre,
        file_info: info.file_info,
        frontpaged: info.frontpaged,
        tags: info.tags,
      },
      appearances: appearances,
      related: related,
      licensing_terms: licensing_terms,
      audio: audio,
      author_comments: author_comments,
      reviews: reviews,
    });
  }

  /**
   * Get details of a playlist.
   * @param {string} id playlist id
   * @returns {Promise<Playlist>}
   */
  async getPlaylist(id: string): Promise<Playlist> {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.setViewport({
      width: 1280,
      height: 720,
    });
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36"
    );
    await page.goto(`https://www.newgrounds.com/playlist/${id}`, {
      waitUntil: ["networkidle0", "networkidle2"],
    });
    const playlistData = await page.evaluate(function () {
      const urlPath = window.location.pathname;
      const playlistIdMatch = urlPath.match(/^\/playlist\/([^\/]+\/[^\/]+)/);
      const playlistId = playlistIdMatch ? playlistIdMatch[1] : "";

      // Extract playlist title
      const playlistTitleElem = document.querySelector("#playlist_outer .pod-head h2");
      const playlistTitle = playlistTitleElem ? playlistTitleElem.textContent?.trim() : "";

      const iconElem = document.querySelector("img.playlist-icon-large");
      const playlistIcon = iconElem ? (iconElem as HTMLImageElement).src : "";
      const authorElem = document.querySelector("ul.authorlinks li div.item-user");
      let author: string | undefined = "";
      let authorIcon = "";
      let authorId = "";
      let authorUrl = "";
      if (authorElem) {
        const authorLink = authorElem.querySelector("a.item-icon");
        if (authorLink) {
          authorUrl = (authorLink as HTMLAnchorElement).href || "";
          try {
            const urlObj = new URL(authorUrl);
            authorId = "";
          } catch (e) {
            authorId = "";
          }
          let iconImg = authorLink.querySelector("img");
          if (!iconImg) {
            const svgImage = authorLink.querySelector("svg image");
            authorIcon = svgImage
              ? svgImage.getAttribute("href") || svgImage.getAttribute("xlink:href") || ""
              : "";
          } else {
            authorIcon = (iconImg as HTMLImageElement).src;
          }
        }
        const authorNameElem = authorElem.querySelector("h4 a");
        author = authorNameElem ? authorNameElem.textContent?.trim() : "";
      }
      const playlistItems: any[] = [];
      const list = document.querySelector("#playlist_list");
      if (!list) {
        return {
          playlistId,
          playlistIcon,
          author,
          authorIcon,
          authorId,
          authorUrl,
          items: playlistItems,
        };
      }
      const items = list.querySelectorAll("li");
      items.forEach((li) => {
        const audioWrapperElem = li.querySelector(".audio-wrapper");
        if (!audioWrapperElem) return;
        const link = audioWrapperElem.querySelector("a.item-audiosubmission");
        if (!link) return;
        const url = (link as HTMLAnchorElement).href;
        const title = link.getAttribute("title") || "";
        const authorElem = link.querySelector(".item-details-main .detail-title span strong");
        const author = authorElem ? authorElem.textContent?.trim() : "";
        const descriptionElem = link.querySelector(".detail-description");
        const description = descriptionElem ? descriptionElem.textContent?.trim() : "";
        const viewsElem = link.querySelector(".item-details-meta dl dd:nth-child(3)");
        const views = viewsElem ? viewsElem.textContent?.trim().replace("Views", "") : "";
        const scoreElem = link.querySelector(".star-score");
        let score = "";
        if (scoreElem && (scoreElem as HTMLDivElement).title) {
          score = (scoreElem as HTMLDivElement).title.replace("Score: ", "").trim().split("/")[0];
        }
        const genreElem = link.querySelector(".item-details-meta dl dd:nth-child(2)");
        const genre = genreElem ? genreElem.textContent?.trim() : "";
        let id = "";
        try {
          const urlObj = new URL(url);
          const pathParts = urlObj.pathname.split("/");
          if (pathParts.length >= 4) {
            id = pathParts[3];
          }
        } catch (e) {
          id = "";
        }
        const iconElem = link.querySelector(".item-icon img");
        const icon = iconElem ? (iconElem as HTMLImageElement).src : "";
        playlistItems.push({
          id,
          title,
          author,
          description,
          url,
          views: views !== "" ? Number(views) : null,
          score: score !== "" ? Number(score) : null,
          genre: genre !== "" ? genre : undefined,
          icon,
        });
      });
      return {
        playlistId,
        playlistTitle,
        playlistIcon,
        author,
        authorIcon,
        authorUrl,
        items: playlistItems,
      };
    });
    await browser.close();
    return new Playlist(this, {
      id: playlistData.playlistId,
      title: playlistData.playlistTitle,
      url: `https://www.newgrounds.com/playlist/${id}`,
      thumbnail: playlistData.playlistIcon,
      author: {
        name: playlistData.author,
        url: playlistData.authorUrl,
        icon: playlistData.authorIcon,
      },
      items: playlistData.items,
    });
  }
}
