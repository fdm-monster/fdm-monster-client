import isURL from "validator/lib/isURL";

describe("url.validator", () => {
  it("should be true", () => {
    const testedUrls = [
      ["http://minipi:1234", true],
      ["http://minipi", true],
      ["https://pi.local/somepath", true],
      ["https://pi.local/somepath/", true],
      ["rack12.local", true],
      ["rack12.local:8080", true],
      ["octopi.local", true],
      ["https://octopi.local", true],
      ["https://octopi.local:8000", true],
      ["http://minipi:80", true],
      ["minipi:1234", true],
      ["minipi", true],
      ["http://localhost:1234", true],
      ["localhost:1234", true],
      ["localhost", true],
      ["127.0.0.1", true],
      ["127.0.0.2", true],
      ["192.168.178.2", true],
      ["https://my.printer.com", true],
      ["my.printer.com", true],
      ["asd", true],
      ["my.printer.com ", true], // space
      ["asd.", false],
      ["ftp://my.printer.com", false],
      ["http://127", false],
      ["http://localhost:wxyz/", false],
      ["http://localhost:wxyz", false],
    ];

    for (const [url, validity] of testedUrls) {
      expect(
        isURL((url as string)?.trimEnd(), {
          protocols: ["http", "https"],
          require_tld: false,
          require_protocol: false,
          require_host: true,
          require_port: false,
          require_valid_protocol: true,
          allow_underscores: true,
          allow_trailing_dot: false,
          allow_protocol_relative_urls: false,
          allow_fragments: false,
          allow_query_components: false,
          validate_length: true,
        })
      ).toBe(validity);
    }
  });
});
