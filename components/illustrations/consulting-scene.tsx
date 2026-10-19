export function ConsultingScene() {
  return <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
    {/* A working consultation, with the business model placed between both people. */}
    <path d="M55 427H665" stroke="var(--scene-line)"/>
    <rect x="78" y="62" width="176" height="199" rx="7" fill="var(--scene-soft)" stroke="var(--scene-line)"/>
    <path d="M166 63V260M79 161H253" stroke="var(--scene-line)"/>
    <path d="M92 143L139 96M107 146L139 114M183 240L231 192" stroke="var(--scene-paper)" strokeWidth="5"/>
    <path d="M70 266H263" stroke="var(--scene-muted)" strokeWidth="3"/>
    <rect x="444" y="70" width="193" height="137" rx="9" fill="var(--scene-paper)" stroke="var(--scene-line)"/>
    <path d="M463 91H522M463 99H499" stroke="var(--scene-muted)"/>
    <path d="M466 179V119M466 179H617" stroke="var(--scene-line)"/>
    <rect className="scene-bar" x="483" y="149" width="20" height="30" rx="3" fill="var(--scene-soft)"/>
    <rect className="scene-bar scene-bar-2" x="518" y="135" width="20" height="44" rx="3" fill="var(--scene-accent-soft)"/>
    <rect className="scene-bar scene-bar-3" x="553" y="119" width="20" height="60" rx="3" fill="var(--scene-accent)"/>
    <path className="scene-trace" d="M482 133L525 118L570 102L608 106" stroke="var(--scene-accent)" strokeDasharray="3 6"/>
    <circle cx="608" cy="106" r="4" fill="var(--scene-accent)"/>
    {/* Chairs and well-supported, naturally bent seated legs. */}
    <path d="M120 288Q115 282 108 286L94 292L110 350H177V340H125Z" fill="var(--scene-soft)" stroke="var(--scene-muted)"/>
    <path d="M114 351L100 426M171 351L190 426" stroke="var(--scene-muted)" strokeWidth="3"/>
    <path d="M534 295L555 288Q562 288 562 297L551 353H484V343H534Z" fill="var(--scene-soft)" stroke="var(--scene-muted)"/>
    <path d="M490 354L473 426M545 354L564 426" stroke="var(--scene-muted)" strokeWidth="3"/>
    <path d="M133 324Q137 341 155 347L208 357L221 409L240 407L233 347Q231 336 217 333L169 318Z" fill="var(--scene-soft)" stroke="var(--scene-ink)"/>
    <path d="M143 326Q140 348 160 353L192 360L193 415H213L218 350Q218 343 207 340L174 324" fill="var(--scene-accent)" stroke="var(--scene-ink)"/>
    <path d="M194 409H213V420L193 422ZM223 405L239 403L243 416L227 418Z" fill="#ca967a" stroke="#241c35"/>
    <path d="M192 418H213L230 425Q234 430 229 432H190ZM225 414H243L258 421Q264 425 259 429H225Z" fill="var(--scene-paper)" stroke="var(--scene-ink)"/>
    <path d="M526 327Q526 347 508 352L469 358L464 412L444 412L443 351Q444 339 456 335L496 322Z" fill="var(--scene-accent)" stroke="var(--scene-ink)"/>
    <path d="M511 328Q509 341 493 346L450 355L427 405L411 399L430 344Q433 336 441 334L483 324Z" fill="var(--scene-soft)" stroke="var(--scene-ink)"/>
    <path d="M445 407H464L465 420H444ZM412 396L429 404L424 417L408 411Z" fill="#e7ba96" stroke="#241c35"/>
    <path d="M445 416H465V430H427Q423 426 429 423ZM407 408L425 414L424 425H388Q384 421 392 418Z" fill="var(--scene-paper)" stroke="var(--scene-ink)"/>
    {/* Left advisor, drawn in three-quarter profile. */}
    <path d="M141 186L139 211L153 220L165 207L161 181" fill="#ca967a" stroke="#241c35"/>
    <path d="M135 158Q133 139 152 136Q172 135 175 155L175 164L180 172L174 175Q175 188 164 192Q151 195 141 179L137 170Q129 170 129 163Q129 158 135 158Z" fill="#ca967a" stroke="#241c35"/>
    <path d="M133 162L139 163L141 151Q155 155 163 144L174 153Q179 140 167 134Q156 126 143 133Q131 131 126 144Q123 153 129 162Z" fill="#241c35" stroke="#241c35"/>
    <path d="M163 160L169 160M166 180Q170 183 173 180M133 163L136 166" stroke="#241c35" strokeWidth="1.4"/>
    <circle cx="168" cy="166" r="1.3" fill="#241c35"/>
    <path d="M138 207L120 218Q111 226 117 250L128 280L129 325Q153 334 180 325L175 272L182 235Q182 219 163 208L153 219Z" fill="var(--scene-paper)" stroke="var(--scene-ink)"/>
    <path d="M138 208L152 220L141 233L131 213M163 209L152 220L165 231L172 216M152 223V322M133 284L135 315" stroke="var(--scene-line)" strokeWidth="1.5"/>
    <path d="M170 224Q179 221 186 234L207 266L239 252L246 265L209 286Q201 290 195 282L168 251" fill="var(--scene-paper)" stroke="var(--scene-ink)"/>
    <path d="M237 252L247 245L262 244Q267 246 263 249L255 251L266 254Q270 258 265 260L248 266L241 265Z" fill="#ca967a" stroke="#241c35"/>
    <path d="M129 226Q119 224 121 239L138 287Q141 294 150 294L210 287L211 275L155 279L146 245" fill="var(--scene-paper)" stroke="var(--scene-ink)"/>
    <path d="M210 275L222 273L237 278Q241 280 237 282L228 281L236 285Q237 289 232 290L211 287Z" fill="#ca967a" stroke="#241c35"/>
    <path d="M140 278L147 286M201 276L203 287" stroke="var(--scene-line)"/>
    {/* Right business owner, listening with a notebook open on the table. */}
    <path d="M502 147Q519 139 533 154Q542 164 537 181L543 219L506 228L488 210Q496 197 492 181Q485 158 502 147Z" fill="#241c35" stroke="#241c35"/>
    <path d="M504 188L502 212L515 223L529 211L521 187" fill="#e7ba96" stroke="#241c35"/>
    <path d="M501 160Q515 149 528 163L528 176Q535 176 534 183Q533 189 527 188L523 198Q515 206 505 198L499 191L494 189L498 181L497 171Z" fill="#e7ba96" stroke="#241c35"/>
    <path d="M498 172Q504 167 509 158Q517 171 528 171L529 159Q519 148 505 154Z" fill="#241c35" stroke="#241c35"/>
    <path d="M501 176L506 175M502 192Q506 195 510 193M529 181L526 183" stroke="#241c35" strokeWidth="1.4"/>
    <circle cx="502" cy="181" r="1.3" fill="#241c35"/>
    <path d="M500 211L485 218Q474 227 479 249L486 277L483 328Q506 337 535 327L533 279L545 237Q548 224 528 212L516 223Z" fill="var(--scene-accent)" stroke="var(--scene-ink)"/>
    <path d="M502 213Q512 232 528 215M492 283L491 320M525 284L528 320" stroke="var(--scene-accent-soft)" strokeWidth="1.6"/>
    <path d="M485 223Q477 222 474 235L466 271L428 279L430 292L478 283Q483 281 485 274L494 243" fill="var(--scene-accent)" stroke="var(--scene-ink)"/>
    <path d="M429 279L416 277L403 282Q399 285 405 287L414 285L404 289Q403 293 408 294L430 292Z" fill="#e7ba96" stroke="#241c35"/>
    <path d="M531 228Q542 226 541 242L529 285Q526 293 516 293L460 286L462 274L513 279L519 245" fill="var(--scene-accent)" stroke="var(--scene-ink)"/>
    <path d="M462 274L450 272L434 278Q430 281 435 283L445 281L436 287Q436 291 440 290L460 286Z" fill="#e7ba96" stroke="#241c35"/>
    <path d="M519 279L516 285M467 275L466 287" stroke="var(--scene-accent-soft)"/>
    {/* A table and a carefully aligned miniature outlet keep the topic tangible. */}
    <path d="M217 317L204 430M454 317L468 430" stroke="var(--scene-muted)" strokeWidth="5"/>
    <path d="M217 365H456" stroke="var(--scene-line)"/>
    <path d="M189 298L213 286H452L481 299V312H189Z" fill="var(--scene-soft)" stroke="var(--scene-ink)"/>
    <path d="M189 299H481" stroke="var(--scene-line)"/>
    <path d="M230 286L239 269H280L270 286Z" fill="var(--scene-paper)" stroke="var(--scene-line)"/>
    <path d="M242 276H269M239 281H260" stroke="var(--scene-muted)" strokeWidth="1.3"/>
    <path d="M391 288L400 269L424 271L450 268L442 288H391Z" fill="var(--scene-paper)" stroke="var(--scene-line)"/>
    <path d="M423 272L418 287M402 278L415 279M429 277L441 276" stroke="var(--scene-line)" strokeWidth="1.3"/>
    <rect x="296" y="221" width="80" height="66" fill="var(--scene-paper)" stroke="var(--scene-ink)"/>
    <path d="M291 237H381L376 219H296Z" fill="var(--scene-accent-soft)" stroke="var(--scene-ink)"/>
    <path d="M307 221L305 236M324 221V236M342 221V236M360 221L363 236M291 237V242H381V237" stroke="var(--scene-ink)" strokeWidth="1.3"/>
    <rect x="305" y="250" width="31" height="23" fill="var(--scene-soft)" stroke="var(--scene-line)"/>
    <rect x="346" y="249" width="20" height="38" fill="var(--scene-soft)" stroke="var(--scene-line)"/>
    <path d="M362 267V273" stroke="var(--scene-ink)"/>
    <rect x="293" y="204" width="86" height="16" rx="2" fill="var(--scene-paper)" stroke="var(--scene-ink)"/>
    <image href="/assets/brandmark-purple.svg" x="330" y="207" width="12" height="11" className="scene-brandmark"/>
    <g className="scene-step"><circle cx="337" cy="165" r="16" fill="var(--scene-accent-soft)" stroke="var(--scene-accent)"/><path d="M330 165L335 170L344 160" stroke="var(--scene-accent)" strokeWidth="2.5"/></g>
    <path d="M593 402V315M593 355L576 337M593 371L617 348" stroke="var(--scene-muted)"/>
    <path d="M592 339Q568 334 575 310Q597 314 592 339ZM594 363Q595 339 620 337Q624 359 594 363ZM591 378Q569 373 568 353Q590 350 591 378Z" fill="var(--scene-accent-soft)" stroke="var(--scene-muted)"/>
    <path d="M574 393H614L607 425H582Z" fill="var(--scene-paper)" stroke="var(--scene-muted)"/>
  </g>;
}
