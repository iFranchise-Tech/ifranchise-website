export function ExpansionScene() {
  return (
    <g strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
      {/* A quiet, planar neighbourhood with two deliberate ground levels. */}
      <path
        d="M48 433H379M431 279H638M478 433H674"
        fill="none"
        stroke="var(--scene-line)"
      />
      <path
        d="M105 448H248M492 292H573M556 447H636"
        fill="none"
        stroke="var(--scene-soft)"
      />
      <path
        d="M118 113V96M109 104H127M641 236V224M635 230H647"
        fill="none"
        stroke="var(--scene-muted)"
        strokeWidth="1.5"
      />

      {/* The path is a shared street: it gently forks toward each branch. */}
      <path
        d="M369 402C400 402 400 369 400 342V308C400 288 411 279 431 279H451M400 342C400 391 432 433 478 433H491"
        fill="none"
        stroke="var(--scene-accent-soft)"
        strokeWidth="9"
      />
      <path
        className="scene-trace"
        d="M369 402C400 402 400 369 400 342V308C400 288 411 279 431 279H451M400 342C400 391 432 433 478 433H491"
        fill="none"
        stroke="var(--scene-accent)"
        strokeWidth="2"
        strokeDasharray="5 9"
      />
      <circle cx="400" cy="342" r="5" fill="var(--scene-paper)" stroke="var(--scene-accent)" />

      {/* Original shop: a shallow cornice, framed glazing and fabric awning. */}
      <rect x="76" y="143" width="231" height="279" rx="3" fill="var(--scene-paper)" stroke="var(--scene-ink)" />
      <path d="M76 183H307M76 403H307" stroke="var(--scene-line)" />
      <path d="M72 143V135H311V143Z" fill="var(--scene-soft)" stroke="var(--scene-ink)" />
      <rect x="160" y="151" width="63" height="24" rx="3" fill="var(--scene-bg)" stroke="var(--scene-line)" strokeWidth="1.5" />
      <image href="/assets/brandmark-purple.svg" x="181.5" y="154" width="20" height="18" className="scene-brandmark" />

      <path d="M73 184H310L320 212H63Z" fill="var(--scene-paper)" stroke="var(--scene-ink)" />
      <path d="M73 184H107L102 212H63ZM141 184H175L174 212H138ZM209 184H243L247 212H210ZM277 184H310L320 212H284Z" fill="var(--scene-accent-soft)" />
      <path d="M73 184H310L320 212H63ZM107 184L102 212M141 184L138 212M175 184L174 212M209 184L210 212M243 184L247 212M277 184L284 212" fill="none" stroke="var(--scene-ink)" strokeWidth="1.5" />
      <path d="M63 212V220Q82.5 233 102 220Q120 233 138 220Q156 233 174 220Q192 233 210 220Q228.5 233 247 220Q265.5 233 284 220Q302 233 320 220V212Z" fill="var(--scene-paper)" stroke="var(--scene-ink)" strokeWidth="1.5" />
      <path d="M63 212H102V220Q82.5 233 63 220ZM138 212H174V220Q156 233 138 220ZM210 212H247V220Q228.5 233 210 220ZM284 212H320V220Q302 233 284 220Z" fill="var(--scene-accent-soft)" stroke="var(--scene-ink)" strokeWidth="1.5" />

      <rect x="92" y="242" width="116" height="144" rx="1" fill="var(--scene-soft)" stroke="var(--scene-ink)" />
      <path d="M100 250H200V378H100Z" fill="var(--scene-bg)" stroke="var(--scene-line)" strokeWidth="1.5" />
      <path d="M113 266L133 246M113 277L142 248M167 276L188 255" fill="none" stroke="var(--scene-paper)" strokeWidth="4" />
      <path d="M100 352H200" stroke="var(--scene-line)" strokeWidth="1.5" />
      <path d="M108 352V334H135V352M114 334V318H130V334" fill="var(--scene-accent-soft)" stroke="var(--scene-line)" strokeWidth="1.5" />
      <path d="M166 352V338M158 338H177L175 352H161Z" fill="var(--scene-paper)" stroke="var(--scene-ink)" strokeWidth="1.5" />
      <path d="M167 338V314M167 330C155 329 152 322 154 316C163 316 167 323 167 330ZM167 323C178 322 183 315 181 308C171 310 166 316 167 323Z" fill="var(--scene-accent-soft)" stroke="var(--scene-ink)" strokeWidth="1.5" />
      <path d="M150 242V386M92 361H208" fill="none" stroke="var(--scene-ink)" strokeWidth="1.5" />
      <rect x="225" y="242" width="63" height="161" rx="1" fill="var(--scene-paper)" stroke="var(--scene-ink)" />
      <rect x="233" y="250" width="47" height="108" rx="1" fill="var(--scene-soft)" stroke="var(--scene-line)" strokeWidth="1.5" />
      <path d="M240 272L260 252M240 283L270 253" fill="none" stroke="var(--scene-paper)" strokeWidth="3" />
      <path d="M275 322V337" stroke="var(--scene-ink)" strokeWidth="2.5" />
      <rect x="233" y="369" width="47" height="24" rx="1" fill="var(--scene-bg)" stroke="var(--scene-line)" strokeWidth="1.5" />
      <path d="M92 395H208M72 422H311V433H72Z" fill="var(--scene-soft)" stroke="var(--scene-ink)" strokeWidth="1.5" />

      {/* The upper branch repeats the architectural language at a smaller scale. */}
      <g>
        <rect x="453" y="112" width="164" height="157" rx="2" fill="var(--scene-paper)" stroke="var(--scene-ink)" />
        <path d="M449 112V104H621V112Z" fill="var(--scene-soft)" stroke="var(--scene-ink)" />
        <rect x="510" y="123" width="49" height="12" rx="6" fill="var(--scene-accent-soft)" />
        <path d="M450 146H620L626 165H444Z" fill="var(--scene-paper)" stroke="var(--scene-ink)" />
        <path d="M450 146H479L476 165H444ZM507 146H535V165H505ZM563 146H591L595 165H565Z" fill="var(--scene-accent-soft)" />
        <path d="M450 146H620L626 165H444ZM444 165V172H626V165M479 146L476 165M507 146L505 165M535 146V165M563 146L565 165M591 146L595 165" fill="none" stroke="var(--scene-ink)" strokeWidth="1.5" />
        <rect x="466" y="185" width="82" height="67" fill="var(--scene-soft)" stroke="var(--scene-ink)" strokeWidth="1.5" />
        <path d="M507 185V252M466 239H548" stroke="var(--scene-line)" strokeWidth="1.5" />
        <path d="M476 201L487 190M476 209L495 190" stroke="var(--scene-paper)" strokeWidth="3" />
        <path d="M480 238V223H496V238M516 238V215H532V238" fill="var(--scene-accent-soft)" stroke="var(--scene-line)" strokeWidth="1.5" />
        <rect x="561" y="185" width="43" height="84" fill="var(--scene-paper)" stroke="var(--scene-ink)" strokeWidth="1.5" />
        <path d="M568 192H597V244H568Z" fill="var(--scene-soft)" stroke="var(--scene-line)" strokeWidth="1.5" />
        <path d="M593 223V232" stroke="var(--scene-ink)" strokeWidth="1.5" />
        <path d="M449 269H621V279H449Z" fill="var(--scene-soft)" stroke="var(--scene-ink)" strokeWidth="1.5" />
        <circle className="scene-step" cx="635" cy="113" r="6" fill="var(--scene-accent)" stroke="var(--scene-paper)" strokeWidth="3" />
      </g>

      {/* The lower branch nestles along the continuation of the street. */}
      <g>
        <rect x="498" y="320" width="154" height="104" rx="2" fill="var(--scene-paper)" stroke="var(--scene-ink)" />
        <path d="M494 320V312H656V320Z" fill="var(--scene-soft)" stroke="var(--scene-ink)" />
        <path d="M495 334H655L661 353H489Z" fill="var(--scene-accent-soft)" stroke="var(--scene-ink)" strokeWidth="1.5" />
        <path d="M522 334L519 353M549 334L548 353M576 334V353M603 334L605 353M629 334L633 353M489 353V360H661V353" fill="none" stroke="var(--scene-ink)" strokeWidth="1.5" />
        <rect x="510" y="372" width="81" height="40" fill="var(--scene-soft)" stroke="var(--scene-ink)" strokeWidth="1.5" />
        <path d="M551 372V412M518 385L526 377M518 394L535 377" fill="none" stroke="var(--scene-paper)" strokeWidth="2.5" />
        <path d="M551 372V412M510 403H591" stroke="var(--scene-line)" strokeWidth="1.5" />
        <path d="M562 402V390H579V402" fill="var(--scene-accent-soft)" stroke="var(--scene-line)" strokeWidth="1.5" />
        <rect x="604" y="372" width="35" height="52" fill="var(--scene-soft)" stroke="var(--scene-ink)" strokeWidth="1.5" />
        <path d="M632 394V401M604 413H639" stroke="var(--scene-ink)" strokeWidth="1.5" />
        <path d="M494 424H656V433H494Z" fill="var(--scene-soft)" stroke="var(--scene-ink)" strokeWidth="1.5" />
        <circle className="scene-step scene-step-2" cx="668" cy="319" r="6" fill="var(--scene-accent)" stroke="var(--scene-paper)" strokeWidth="3" />
      </g>

      {/* An adult owner, drawn at a little over seven heads tall. */}
      <g stroke="var(--scene-ink)">
        <path d="M317 306L351 307C355 327 352 348 352 368L359 419L345 421L333 370L329 344L325 376L319 421H305L309 372L310 324Z" fill="var(--scene-ink)" />
        <path d="M328 315L329 344M315 335L312 368M342 365L351 407" fill="none" stroke="var(--scene-muted)" strokeWidth="1.5" />
        <path d="M306 419H319L322 426L324 433H300C298 428 301 423 306 419ZM345 420H358L362 426L370 429V433H344Z" fill="var(--scene-paper)" strokeWidth="1.8" />
        <path d="M300 430H323M345 430H368M307 424H314M352 425H358" fill="none" strokeWidth="1.3" />

        <path d="M316 251C310 259 307 274 305 287L299 311L308 315L319 288L326 264Z" fill="#ca967a" strokeWidth="1.6" />
        <path d="M299 310L296 321C295 326 298 331 301 330L302 322L304 331C305 333 308 331 307 328L307 320L310 314Z" fill="#e7ba96" strokeWidth="1.5" />
        <path d="M351 252L371 276L389 263L395 269L374 287C371 290 367 289 364 285L343 263Z" fill="#ca967a" strokeWidth="1.6" />
        <path d="M389 263L393 257C395 255 398 255 399 257L403 259C405 261 403 264 400 264L395 269Z" fill="#e7ba96" strokeWidth="1.5" />

        <path d="M324 239L315 246C311 250 309 255 308 261L321 271L317 306Q333 312 352 306L349 271L359 267L354 252L343 241Z" fill="var(--scene-accent)" strokeWidth="1.8" />
        <path d="M326 233V245Q334 253 341 243L340 231Z" fill="#ca967a" strokeWidth="1.6" />
        <path d="M323 243Q331 256 343 242M317 263L321 271M349 259V271M323 297Q334 300 346 297" fill="none" stroke="var(--scene-accent-soft)" strokeWidth="1.5" />

        <g transform="translate(0 64) scale(1 .73)">
          <path d="M320 215C318 207 322 199 332 198C342 197 348 204 347 215L345 228C343 236 337 240 330 237C325 235 322 230 322 224C318 225 316 220 318 217Z" fill="#e7ba96" strokeWidth="1.6" />
          <path d="M320 219C316 212 318 202 324 199C329 194 342 195 347 203C349 207 349 212 347 216L343 213L342 205C336 209 329 209 323 207L323 218Z" fill="#241c35" stroke="#241c35" strokeWidth="1.5" />
          <path d="M327 216H330M339 216H342M335 217L334 224H337M331 229Q335 232 339 228" fill="none" stroke="#241c35" strokeWidth="1.3" />
          <path d="M320 218L321 221" fill="none" stroke="#ca967a" strokeWidth="1.2" />
        </g>
      </g>

      {/* Small street planting adds life without competing with the people. */}
      <path d="M57 411H76L73 433H61Z" fill="var(--scene-accent-soft)" stroke="var(--scene-ink)" strokeWidth="1.5" />
      <path d="M67 411V387M67 403C57 403 51 396 52 389C62 390 67 396 67 403ZM67 394C76 393 81 385 78 379C69 381 66 387 67 394Z" fill="var(--scene-soft)" stroke="var(--scene-ink)" strokeWidth="1.5" />
    </g>
  );
}
