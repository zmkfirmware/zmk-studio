import sponsors from "../data/sponsors.ts";
import SponsorSize from "../enums/SponsorSize.ts";
import { ExternalLink } from "../misc/ExternalLink.tsx";
import React from "react";

export function About() {
  return <>
    <div className="flex justify-between items-start">
      <p>
        The ZMK Project:{ " " }
        <ExternalLink href="https://zmk.dev/">website</ExternalLink>,{ " " }
        <ExternalLink href="https://github.com/zmkfirmware/zmk/issues/">
          GitHub Issues
        </ExternalLink>
        ,{ " " }
        <ExternalLink href="https://zmk.dev/community/discord/invite">
          Discord Server
        </ExternalLink>
      </p>
    </div>
    <div>
      <p className="py-1 mr-2">
        ZMK Studio is made possible thanks to the generous donation of time
        from our contributors, as well as the financial sponsorship from the
        following vendors:
      </p>
    </div>
    <div
        className="grid gap-2 auto-rows-auto grid-cols-[auto_minmax(min-content,1fr)] justify-items-center items-center">
      { sponsors.map( ( s ) => {
        const heightVariants = {
          [SponsorSize.Large]: "h-16", [SponsorSize.Medium]: "h-12", [SponsorSize.Small]: "h-8",
        };

        return (<React.Fragment key={ s.level }>
              <label>{ s.level }</label>
              <div
                  className={ `grid grid-rows-1 gap-x-1 auto-cols-fr grid-flow-col justify-items-center items-center ${ heightVariants[s.size] }` }
              >
                { s.vendors.map( ( v ) => {
                  const maxSizeVariants = {
                    [SponsorSize.Large]: "max-h-16", [SponsorSize.Medium]: "max-h-12", [SponsorSize.Small]: "max-h-8",
                  };

                  return (<a key={ v.name } href={ v.url } target="_blank">
                        <picture aria-label={ v.name }>
                          { v.darkModeImg && (<source
                                  className={ maxSizeVariants[s.size] }
                                  srcSet={ v.darkModeImg }
                                  media="(prefers-color-scheme: dark)"
                              />) }
                          <img className={ maxSizeVariants[s.size] } src={ v.img } />
                        </picture>
                      </a>);
                } ) }
              </div>
            </React.Fragment>);
      } ) }
    </div>
  </>;
}
