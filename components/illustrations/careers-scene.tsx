export function CareersScene() {
  return (
    <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      {/* A quiet, shared workshop: all of the activity belongs to the room. */}
      <path d="M58 422H665" stroke="var(--scene-line)" />
      <path d="M68 435H133M580 435H650" stroke="var(--scene-line)" />

      {/* Recessed window and a small, useful wall shelf. */}
      <rect x="68" y="95" width="70" height="197" rx="8" fill="var(--scene-soft)" stroke="var(--scene-line)" />
      <path d="M103 96V291M69 182H137" stroke="var(--scene-line)" />
      <path d="M79 168L93 154M112 148L126 134M79 269L93 255" stroke="var(--scene-paper)" strokeWidth="4" />
      <path d="M88 308H135" stroke="var(--scene-muted)" />
      <path d="M96 308V317M128 308V317" stroke="var(--scene-line)" />

      {/* Wall-mounted planning board, with a clear route and completed steps. */}
      <rect x="279" y="78" width="348" height="202" rx="13" fill="var(--scene-soft)" />
      <rect x="274" y="73" width="348" height="202" rx="13" fill="var(--scene-paper)" stroke="var(--scene-line)" />
      <path d="M294 106H602" stroke="var(--scene-line)" />
      <rect x="294" y="88" width="48" height="5" rx="2.5" fill="var(--scene-accent)" stroke="none" />
      <rect x="350" y="88" width="26" height="5" rx="2.5" fill="var(--scene-line)" stroke="none" />
      <circle cx="591" cy="90" r="2" fill="var(--scene-muted)" stroke="none" />
      <circle cx="601" cy="90" r="2" fill="var(--scene-muted)" stroke="none" />
      <path d="M455 123V253" stroke="var(--scene-line)" />

      <rect x="296" y="127" width="19" height="19" rx="5" fill="var(--scene-accent-soft)" stroke="var(--scene-accent)" />
      <path className="scene-step" d="M301 136L305 140L311 132" stroke="var(--scene-accent)" strokeWidth="2.3" />
      <path d="M327 131H417M327 141H391" stroke="var(--scene-muted)" />
      <rect x="296" y="167" width="19" height="19" rx="5" fill="var(--scene-accent-soft)" stroke="var(--scene-accent)" />
      <path className="scene-step scene-step-2" d="M301 176L305 180L311 172" stroke="var(--scene-accent)" strokeWidth="2.3" />
      <path d="M327 171H425M327 181H399" stroke="var(--scene-muted)" />
      <rect x="296" y="207" width="19" height="19" rx="5" stroke="var(--scene-line)" />
      <path d="M327 211H407M327 221H381" stroke="var(--scene-line)" />
      <path d="M297 248H422" stroke="var(--scene-line)" />
      <path d="M297 248H366" stroke="var(--scene-accent)" strokeWidth="3" />

      <path d="M483 136H543Q554 136 554 147V166Q554 177 543 177H499Q488 177 488 188V208Q488 219 499 219H590" stroke="var(--scene-accent-soft)" strokeWidth="7" />
      <path className="scene-trace" d="M483 136H543Q554 136 554 147V166Q554 177 543 177H499Q488 177 488 188V208Q488 219 499 219H590" stroke="var(--scene-accent)" strokeDasharray="3 7" />
      <circle cx="483" cy="136" r="7" fill="var(--scene-accent)" stroke="var(--scene-paper)" strokeWidth="3" />
      <g className="scene-step scene-step-2">
        <circle cx="554" cy="157" r="7" fill="var(--scene-paper)" stroke="var(--scene-accent)" />
        <circle cx="554" cy="157" r="2" fill="var(--scene-accent)" stroke="none" />
      </g>
      <g className="scene-step scene-step-3">
        <rect x="579" y="208" width="23" height="23" rx="6" fill="var(--scene-accent)" stroke="var(--scene-paper)" />
        <path d="M585 219L589 223L596 215" stroke="var(--scene-paper)" />
      </g>
      <path d="M479 248H511M519 248H537" stroke="var(--scene-line)" />

      {/* A rooted plant, its leaves arranged around one branching stem. */}
      <path d="M95 383V336M95 363L77 345M95 353L112 328M95 375L116 360" stroke="var(--scene-muted)" />
      <path d="M94 347C79 342 78 327 82 316C94 320 101 332 94 347Z" fill="var(--scene-accent-soft)" stroke="var(--scene-muted)" />
      <path d="M110 334C105 321 114 307 126 304C128 317 122 331 110 334Z" fill="var(--scene-soft)" stroke="var(--scene-muted)" />
      <path d="M79 350C64 349 57 337 59 328C72 328 82 337 79 350Z" fill="var(--scene-soft)" stroke="var(--scene-muted)" />
      <path d="M111 366C110 354 124 346 134 350C130 363 121 369 111 366Z" fill="var(--scene-accent-soft)" stroke="var(--scene-muted)" />
      <path d="M76 383H115L110 416Q109 422 103 422H87Q81 422 80 416Z" fill="var(--scene-paper)" stroke="var(--scene-muted)" />
      <path d="M79 390H112" stroke="var(--scene-line)" />

      {/* Standing facilitator: full-length, tailored silhouette and bent arms. */}
      <path d="M164 274L190 277L187 329L178 394L158 394L159 330Z" fill="var(--scene-accent)" stroke="var(--scene-ink)" />
      <path d="M186 278L212 275L215 327L227 395L207 399L188 335L180 304" fill="var(--scene-accent)" stroke="var(--scene-ink)" />
      <path d="M169 302L169 333L166 382M201 307L205 334L216 383" stroke="var(--scene-accent-soft)" strokeWidth="1.4" />
      <path d="M159 391L178 393L178 402L157 404Z" fill="#ca967a" stroke="#241c35" />
      <path d="M207 394L226 392L231 403L211 406Z" fill="#ca967a" stroke="#241c35" />
      <path d="M157 400L176 400Q179 402 182 406L193 412Q197 415 195 420H153Q150 416 152 410Z" fill="var(--scene-paper)" stroke="var(--scene-ink)" />
      <path d="M210 403L229 399L236 407L249 412Q253 415 252 420H209Q206 414 210 403Z" fill="var(--scene-paper)" stroke="var(--scene-ink)" />
      <path d="M154 415H193M211 415H248M177 407L182 405M229 407L234 405" stroke="var(--scene-line)" />

      {/* Neck and the far arm are behind the shirt. */}
      <path d="M180 157L179 177L188 187L200 174L194 155Z" fill="#ca967a" stroke="#241c35" />
      <path d="M161 185Q151 186 147 200L136 236Q134 242 138 250L151 270L162 263L151 241L169 207Z" fill="var(--scene-paper)" stroke="var(--scene-ink)" />
      <path d="M152 264L161 259L168 269L170 281Q170 285 167 285L162 277L164 288Q163 292 160 289L153 280L149 271Z" fill="#ca967a" stroke="#241c35" />
      <path d="M160 269L164 274" stroke="#241c35" strokeWidth="1.3" />
      <path d="M177 173L163 180Q155 184 156 197L161 231L158 276Q183 286 215 276L213 230L222 197Q221 184 205 178L198 173L188 183Z" fill="var(--scene-paper)" stroke="var(--scene-ink)" />
      <path d="M178 173L188 183L181 192L171 180M198 173L188 183L196 192L205 178M188 186V271" stroke="var(--scene-line)" strokeWidth="1.6" />
      <path d="M166 229L164 244M207 250L209 267M164 272Q185 278 210 273" stroke="var(--scene-line)" strokeWidth="1.4" />
      <circle cx="192" cy="207" r="1.2" fill="var(--scene-muted)" stroke="none" />
      <circle cx="192" cy="230" r="1.2" fill="var(--scene-muted)" stroke="none" />
      <circle cx="192" cy="253" r="1.2" fill="var(--scene-muted)" stroke="none" />

      {/* One raised forearm naturally leads the eye to the planning board. */}
      <path d="M212 185Q220 185 226 192L247 211L278 181L289 192L255 229Q250 235 242 230L211 210" fill="var(--scene-paper)" stroke="var(--scene-ink)" />
      <path d="M274 185L285 196M240 214L247 219" stroke="var(--scene-line)" />
      <path d="M281 182L289 173L302 164L310 162Q314 162 313 165L303 171L313 170Q317 171 315 174L306 177L312 177Q315 178 313 181L302 185L290 192Z" fill="#ca967a" stroke="#241c35" />
      <path d="M291 180L298 177M302 171L306 171" stroke="#241c35" strokeWidth="1.3" />

      {/* A recognisable, understated face with an organic cropped hairstyle. */}
      <g transform="translate(188 145) scale(.74) translate(-188 -145)">
      <path d="M168 132Q169 117 188 117Q204 118 206 134L206 142L211 149L206 152L205 159Q201 169 190 168L180 163L174 151Q165 151 164 144Q163 138 168 137Z" fill="#ca967a" stroke="#241c35" />
      <path d="M169 141Q165 142 169 146M197 140L201 141M198 156Q201 158 204 156" stroke="#241c35" strokeWidth="1.5" />
      <circle cx="200" cy="145" r="1.25" fill="#241c35" stroke="none" />
      <path d="M169 139L173 139L174 129Q181 131 187 126Q193 131 200 127L205 134Q210 128 207 122Q209 115 202 113Q200 107 192 111Q187 105 181 110Q173 106 169 114Q162 113 162 122Q158 130 164 137Z" fill="#241c35" stroke="#241c35" />
      <path d="M173 118Q177 114 182 117M187 115Q192 113 196 117" stroke="#ca967a" strokeWidth="1.1" opacity="0.55" />
      </g>

      {/* Ergonomic chair with visible seat, back support, and a stable base. */}
      <path d="M456 349L462 381H500" stroke="var(--scene-muted)" strokeWidth="4" />
      <path d="M481 378V408M458 420L481 408L506 420" stroke="var(--scene-muted)" strokeWidth="3" />
      <circle cx="457" cy="420" r="3" fill="var(--scene-muted)" stroke="none" />
      <circle cx="507" cy="420" r="3" fill="var(--scene-muted)" stroke="none" />
      <path d="M433 302Q430 295 438 293L453 290Q461 289 463 298L473 343L447 350Z" fill="var(--scene-accent-soft)" stroke="var(--scene-muted)" />
      <path d="M447 354Q447 348 454 348H511Q518 348 518 355V360H451Q447 360 447 354Z" fill="var(--scene-accent-soft)" stroke="var(--scene-muted)" />

      {/* Seated colleague: knees and elbows have clear, plausible articulation. */}
      <path d="M474 338Q493 336 514 341L545 353Q550 355 551 362L551 402L535 404L530 369L500 363L477 358Z" fill="var(--scene-soft)" stroke="var(--scene-ink)" />
      <path d="M469 337Q461 352 474 360L515 370L524 407L542 405L535 362Q534 356 529 354L493 340Z" fill="var(--scene-paper)" stroke="var(--scene-ink)" />
      <path d="M480 350L523 362L531 393" stroke="var(--scene-line)" strokeWidth="1.5" />
      <path d="M526 403L539 401L542 411L528 413Z" fill="#e7ba96" stroke="#241c35" />
      <path d="M536 400H550L553 410L540 413Z" fill="#e7ba96" stroke="#241c35" />
      <path d="M538 408H552L563 414Q569 417 566 422H536L533 418Z" fill="var(--scene-accent)" stroke="var(--scene-ink)" />
      <path d="M526 410H541L548 415L560 417Q564 419 561 423H524Q521 418 526 410Z" fill="var(--scene-paper)" stroke="var(--scene-ink)" />
      <path d="M525 419H558" stroke="var(--scene-line)" />

      {/* Hair is deliberately constant across the two colour themes. */}
      <g transform="translate(474 247) scale(.84) translate(-474 -247)">
      <path d="M452 245Q444 241 444 232Q444 221 455 217Q467 211 481 220Q493 228 487 245L482 273L451 275Q454 261 452 245Z" fill="#241c35" stroke="#241c35" />
      <path d="M464 259L462 280L474 286L484 276L478 255Z" fill="#e7ba96" stroke="#241c35" />
      <path d="M456 238Q455 225 470 223Q484 223 486 238L487 245L493 251L487 254L486 261Q481 270 470 265L462 258L458 248Q452 247 452 242Q452 237 456 238Z" fill="#e7ba96" stroke="#241c35" />
      <path d="M455 241L458 244M479 240L483 241M478 257Q481 259 485 257" stroke="#241c35" strokeWidth="1.4" />
      <circle cx="482" cy="245" r="1.25" fill="#241c35" stroke="none" />
      <path d="M453 240Q451 227 460 221Q469 216 479 223L484 230Q471 232 467 226Q463 238 456 242Z" fill="#241c35" stroke="#241c35" />
      <path d="M449 235Q449 224 457 222M450 251L452 265" stroke="#e7ba96" strokeWidth="1.1" opacity="0.5" />
      </g>

      <path d="M461 275Q447 280 448 296L453 320L451 340Q471 350 495 339L490 307L489 288L480 275Q471 283 461 275Z" fill="var(--scene-accent)" stroke="var(--scene-ink)" />
      <path d="M461 277Q468 290 481 278M457 317L459 335M484 319L487 337" stroke="var(--scene-accent-soft)" strokeWidth="1.5" />
      <path d="M483 286Q489 284 494 293L506 314L530 314L532 324L502 328Q498 328 495 324L480 305" fill="var(--scene-accent)" stroke="var(--scene-ink)" />
      <path d="M529 314L539 312L550 315Q553 317 550 318L542 318L549 321Q551 324 547 324L532 324Z" fill="#e7ba96" stroke="#241c35" />
      <path d="M460 288Q466 285 471 294L488 321L522 324L522 335L483 335Q478 335 475 330L456 307" fill="var(--scene-accent)" stroke="var(--scene-ink)" />
      <path d="M477 321L482 326M514 324V334" stroke="var(--scene-accent-soft)" strokeWidth="1.5" />
      <path d="M522 324L533 321L545 325Q549 327 545 329L536 327L543 331Q546 334 541 335L522 334Z" fill="#e7ba96" stroke="#241c35" />

      {/* The desk overlaps the forearms at the correct working height. */}
      <path d="M502 346L496 421M630 346L639 421" stroke="var(--scene-muted)" strokeWidth="4" />
      <path d="M501 350H631M500 385H634" stroke="var(--scene-line)" />
      <rect x="483" y="335" width="165" height="10" rx="4" fill="var(--scene-paper)" stroke="var(--scene-ink)" />
      <path d="M540 326L553 286Q554 282 558 282H610Q614 282 613 286L602 326Z" fill="var(--scene-soft)" stroke="var(--scene-ink)" />
      <path d="M548 321L558 288H606L597 321Z" fill="var(--scene-accent-soft)" stroke="var(--scene-line)" strokeWidth="1.4" />
      <path d="M525 327H603V330Q603 334 599 334H528Q524 334 524 331Z" fill="var(--scene-paper)" stroke="var(--scene-ink)" />
      <path d="M551 329H571" stroke="var(--scene-line)" strokeWidth="1.4" />
      <circle cx="580" cy="305" r="4" stroke="var(--scene-accent)" strokeWidth="1.6" />

      {/* A notebook and a mug finish the practical, lived-in workspace. */}
      <path d="M614 330H636L639 334H614Z" fill="var(--scene-accent-soft)" stroke="var(--scene-muted)" strokeWidth="1.5" />
      <path d="M620 305H636V323Q636 327 632 327H624Q620 327 620 323Z" fill="var(--scene-paper)" stroke="var(--scene-muted)" strokeWidth="1.7" />
      <path d="M636 309H640Q645 309 644 314Q644 319 636 319M622 309H633" stroke="var(--scene-muted)" strokeWidth="1.7" />
    </g>
  );
}
