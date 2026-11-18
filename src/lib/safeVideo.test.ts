import { describe, expect, it } from "vitest";
import { safeVideoEmbed } from "./safeVideo";

describe("safeVideoEmbed", () => {
  it("acepta enlaces de YouTube en sus formatos habituales", () => {
    const embed = "https://www.youtube-nocookie.com/embed/aBc_12-XYz9";
    expect(safeVideoEmbed("https://www.youtube.com/watch?v=aBc_12-XYz9")).toBe(embed);
    expect(safeVideoEmbed("https://youtu.be/aBc_12-XYz9")).toBe(embed);
    expect(safeVideoEmbed("https://www.youtube.com/shorts/aBc_12-XYz9")).toBe(embed);
    expect(safeVideoEmbed("https://www.youtube.com/embed/aBc_12-XYz9")).toBe(embed);
    expect(safeVideoEmbed("https://m.youtube.com/watch?v=aBc_12-XYz9&t=10")).toBe(embed);
  });

  it("acepta enlaces de Vimeo", () => {
    expect(safeVideoEmbed("https://vimeo.com/123456789")).toBe("https://player.vimeo.com/video/123456789");
    expect(safeVideoEmbed("https://player.vimeo.com/video/123456789")).toBe("https://player.vimeo.com/video/123456789");
  });

  it("rechaza protocolos que no sean https", () => {
    expect(safeVideoEmbed("http://youtu.be/aBc_12-XYz9")).toBeNull();
    expect(safeVideoEmbed("javascript:alert(1)")).toBeNull();
    expect(safeVideoEmbed("data:text/html,<script>")).toBeNull();
  });

  it("rechaza otros dominios y vídeos incrustados de terceros", () => {
    expect(safeVideoEmbed("https://evil-youtube.com/watch?v=aBc_12-XYz9")).toBeNull();
    expect(safeVideoEmbed("https://youtube.com.evil.com/watch?v=aBc_12-XYz9")).toBeNull();
    expect(safeVideoEmbed("https://dailymotion.com/video/x123")).toBeNull();
  });

  it("rechaza identificadores con formato raro o vacíos", () => {
    expect(safeVideoEmbed("https://youtu.be/")).toBeNull();
    expect(safeVideoEmbed("https://www.youtube.com/watch")).toBeNull();
    expect(safeVideoEmbed("https://youtu.be/<script>")).toBeNull();
    expect(safeVideoEmbed("https://vimeo.com/abc")).toBeNull();
    expect(safeVideoEmbed("")).toBeNull();
    expect(safeVideoEmbed(null)).toBeNull();
    expect(safeVideoEmbed("no es una url")).toBeNull();
  });
});
