export function TeamScene() {
  return (
    <g fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      {/* A shared room, with one continuous floor and useful objects on its walls. */}
      <path d="M58 423H663M70 437H134M585 437H648" stroke="var(--scene-line)" />
      <path d="M94 147H214M105 147V157M202 147V157" stroke="var(--scene-muted)" />
      <rect x="109" y="112" width="10" height="34" rx="2" fill="var(--scene-accent-soft)" stroke="var(--scene-muted)" />
      <rect x="121" y="106" width="13" height="40" rx="2" fill="var(--scene-paper)" stroke="var(--scene-muted)" />
      <path d="M137 112L147 109L158 144L147 147Z" fill="var(--scene-soft)" stroke="var(--scene-muted)" />
      <path d="M124 114H131M125 137H131M112 136H116" stroke="var(--scene-line)" strokeWidth="1.3" />
      <path d="M179 129Q179 119 188 119Q197 119 197 129V145H179Z" fill="var(--scene-soft)" stroke="var(--scene-muted)" />
      <path d="M188 119V107M188 113Q174 113 174 101Q186 102 188 113ZM188 108Q189 94 202 95Q200 107 188 108Z" fill="var(--scene-accent-soft)" stroke="var(--scene-muted)" strokeWidth="1.6" />

      {/* The planning board is tangible and quietly communicates shared progress. */}
      <rect x="266" y="77" width="231" height="121" rx="11" fill="var(--scene-soft)" />
      <rect x="261" y="72" width="231" height="121" rx="11" fill="var(--scene-paper)" stroke="var(--scene-line)" />
      <path d="M279 95H474" stroke="var(--scene-line)" />
      <rect x="279" y="83" width="41" height="4" rx="2" fill="var(--scene-accent)" stroke="none" />
      <circle cx="473" cy="85" r="2" fill="var(--scene-muted)" stroke="none" />
      <path d="M290 122H334Q343 122 343 131V148Q343 157 352 157H397Q406 157 406 148V124Q406 115 415 115H457" stroke="var(--scene-accent-soft)" strokeWidth="6" />
      <path className="scene-trace" d="M290 122H334Q343 122 343 131V148Q343 157 352 157H397Q406 157 406 148V124Q406 115 415 115H457" stroke="var(--scene-accent)" strokeDasharray="3 7" />
      <circle cx="290" cy="122" r="7" fill="var(--scene-accent)" stroke="var(--scene-paper)" strokeWidth="3" />
      <g className="scene-step">
        <rect x="332" y="131" width="21" height="21" rx="5" fill="var(--scene-paper)" stroke="var(--scene-accent)" />
        <path d="M337 141L341 145L348 137" stroke="var(--scene-accent)" />
      </g>
      <g className="scene-step scene-step-2">
        <rect x="446" y="105" width="21" height="21" rx="5" fill="var(--scene-accent)" stroke="var(--scene-paper)" />
        <path d="M451 115L455 119L462 111" stroke="var(--scene-paper)" />
      </g>
      <path d="M279 176H307M429 157H469M429 166H455" stroke="var(--scene-line)" />

      {/* A second shelf balances the room without adding a floating icon field. */}
      <path d="M536 147H629M545 147V157M620 147V157" stroke="var(--scene-muted)" />
      <rect x="550" y="109" width="28" height="38" rx="3" fill="var(--scene-paper)" stroke="var(--scene-line)" />
      <path d="M555 140L562 128L569 133L574 121" stroke="var(--scene-accent)" strokeWidth="1.7" />
      <path d="M593 139L593 122Q593 115 601 115Q609 115 609 122V139" stroke="var(--scene-muted)" />
      <path d="M588 139H614V146H588Z" fill="var(--scene-accent-soft)" stroke="var(--scene-muted)" />

      {/* Chairs and legs establish the seating arrangement before the tabletop. */}
      <path d="M313 236Q313 226 323 226H398Q408 226 408 236V304H313Z" fill="var(--scene-soft)" stroke="var(--scene-muted)" />
      <path d="M326 312L321 405M393 312L399 405" stroke="var(--scene-muted)" strokeWidth="3" />
      <path d="M332 284L361 290L356 348L346 401H330L330 350Z" fill="var(--scene-accent)" stroke="var(--scene-ink)" />
      <path d="M361 288L389 283L391 347L383 401H366L368 349L357 319" fill="var(--scene-accent)" stroke="var(--scene-ink)" />
      <path d="M332 398H346V408H330ZM368 398H382L384 408H369Z" fill="#ca967a" stroke="#241c35" />
      <path d="M330 405H346L352 415Q355 419 351 423H321Q318 418 322 413Z" fill="var(--scene-paper)" stroke="var(--scene-ink)" />
      <path d="M368 405H383L390 412L398 416Q402 419 399 423H366Q362 420 365 413Z" fill="var(--scene-paper)" stroke="var(--scene-ink)" />
      <path d="M322 418H349M367 418H397" stroke="var(--scene-line)" />

      <path d="M123 277Q120 269 129 266L148 260Q157 258 161 268L179 328L145 340Z" fill="var(--scene-accent-soft)" stroke="var(--scene-muted)" />
      <path d="M145 342H216Q222 342 221 349H147Z" fill="var(--scene-accent-soft)" stroke="var(--scene-muted)" />
      <path d="M150 350L140 422M209 350L220 422" stroke="var(--scene-muted)" strokeWidth="3" />
      <path d="M177 322Q195 317 211 328L244 349Q249 353 249 360L243 406H227L228 365L198 354L177 348Z" fill="var(--scene-accent)" stroke="var(--scene-ink)" />
      <path d="M167 325Q161 343 180 350L211 364L205 407H222L232 357Q233 353 228 349L196 327" fill="var(--scene-accent)" stroke="var(--scene-ink)" />
      <path d="M182 338L218 358L214 396" stroke="var(--scene-accent-soft)" strokeWidth="1.5" />
      <path d="M206 403H222V411H205ZM228 402H243L244 411H228Z" fill="#ca967a" stroke="#241c35" />
      <path d="M205 408H222L228 414L239 417Q242 419 240 423H202Q199 418 205 408Z" fill="var(--scene-paper)" stroke="var(--scene-ink)" />
      <path d="M228 407H244L251 414L263 417Q267 420 263 423H228Q225 417 228 407Z" fill="var(--scene-paper)" stroke="var(--scene-ink)" />
      <path d="M204 419H236M230 419H260" stroke="var(--scene-line)" />

      <path d="M579 264Q582 257 590 260L609 266Q617 269 614 277L596 338L562 327Z" fill="var(--scene-soft)" stroke="var(--scene-muted)" />
      <path d="M525 341H595V349H523Q521 343 525 341Z" fill="var(--scene-soft)" stroke="var(--scene-muted)" />
      <path d="M530 350L519 422M590 350L600 422" stroke="var(--scene-muted)" strokeWidth="3" />
      <path d="M559 323Q543 318 528 326L500 346Q494 350 494 358L499 405H516L515 365L541 354L561 348Z" fill="var(--scene-paper)" stroke="var(--scene-ink)" />
      <path d="M570 327Q575 344 558 351L530 366L538 407H521L507 360Q505 353 511 349L542 327" fill="var(--scene-soft)" stroke="var(--scene-ink)" />
      <path d="M554 339L519 359L529 397" stroke="var(--scene-line)" strokeWidth="1.5" />
      <path d="M500 402H515V412H499ZM522 403H537L540 412H524Z" fill="#e7ba96" stroke="#241c35" />
      <path d="M500 408H515L518 418Q519 423 515 423H480Q477 419 482 416L492 413Z" fill="var(--scene-accent)" stroke="var(--scene-ink)" />
      <path d="M524 409H539L545 417Q547 422 542 423H509Q506 420 511 416Z" fill="var(--scene-paper)" stroke="var(--scene-ink)" />
      <path d="M512 419H541" stroke="var(--scene-line)" />

      {/* Central colleague faces the group, with shoulders and hands at ease. */}
      <path d="M352 172V188L362 199L374 187L371 171Z" fill="#ca967a" stroke="#241c35" />
      <path d="M350 185L333 192Q322 198 323 215L328 271H394L399 215Q400 199 389 193L374 185L362 197Z" fill="var(--scene-paper)" stroke="var(--scene-ink)" />
      <path d="M350 185L362 197L355 224L342 196M374 185L362 197L370 224L384 196" stroke="var(--scene-line)" />
      <path d="M355 223L362 197L370 223V271H355Z" fill="var(--scene-accent)" stroke="var(--scene-ink)" strokeWidth="1.3" />
      <path d="M337 217L339 252M385 217L383 252M331 263H347M377 263H391" stroke="var(--scene-line)" strokeWidth="1.5" />
      <path d="M343 150Q343 132 361 131Q380 131 382 149L380 166Q376 180 363 181Q349 179 345 166L342 158Q337 156 339 151Q340 148 343 150Z" fill="#ca967a" stroke="#241c35" />
      <path d="M379 150Q385 147 386 152Q387 157 381 159M342 153L344 156" stroke="#241c35" strokeWidth="1.5" />
      <path d="M343 151L347 151L348 141Q360 145 369 137L378 143L380 151L383 149Q387 136 376 129Q369 123 358 127Q346 124 340 136Q336 145 343 151Z" fill="#241c35" stroke="#241c35" />
      <path d="M349 151L354 150M368 150L373 151M361 155L359 161L363 162M356 168Q362 172 369 168" stroke="#241c35" strokeWidth="1.5" />
      <circle cx="352" cy="156" r="1.2" fill="#241c35" stroke="none" />
      <circle cx="371" cy="156" r="1.2" fill="#241c35" stroke="none" />
      <path d="M347 135Q353 130 360 132" stroke="#ca967a" strokeWidth="1.1" opacity="0.55" />

      {/* One substantial oval table connects all three seats. */}
      <path d="M350 341L338 407Q336 414 344 416H392Q399 413 396 407L383 341Z" fill="var(--scene-soft)" stroke="var(--scene-muted)" />
      <path d="M360 359L357 402M375 359L379 402" stroke="var(--scene-line)" />
      <path d="M182 309V321C182 352 266 377 370 377C474 377 558 352 558 321V309Z" fill="var(--scene-soft)" stroke="var(--scene-muted)" />
      <ellipse cx="370" cy="309" rx="188" ry="56" fill="var(--scene-paper)" stroke="var(--scene-muted)" />
      <path d="M202 325Q225 343 264 350M478 349Q516 340 537 325" stroke="var(--scene-line)" strokeWidth="1.4" />

      {/* Documents sit flat on the table; no screen repeats the other scenes. */}
      <path d="M325 294L379 286L417 314L361 326Z" fill="var(--scene-accent-soft)" stroke="var(--scene-line)" />
      <path d="M343 296L374 292M348 302L371 299M365 315L372 307L383 310L391 302" stroke="var(--scene-accent)" strokeWidth="1.6" />
      <path d="M274 311L308 316L294 336L262 329Z" fill="var(--scene-soft)" stroke="var(--scene-line)" />
      <path d="M272 325L292 328M277 319L299 322" stroke="var(--scene-muted)" strokeWidth="1.5" />
      <path d="M438 302L472 295L491 308L456 317Z" fill="var(--scene-paper)" stroke="var(--scene-line)" />
      <path d="M449 303L471 299M454 308L479 303" stroke="var(--scene-muted)" strokeWidth="1.5" />
      <path d="M415 334L441 324" stroke="var(--scene-accent)" strokeWidth="3" />
      <path d="M411 336L416 335L414 332Z" fill="var(--scene-muted)" stroke="none" />

      {/* The central colleague's forearms rest on the near edge of the board. */}
      <path d="M327 205Q320 202 315 215L305 250Q302 259 310 265L336 281L345 272L322 253L337 218" fill="var(--scene-paper)" stroke="var(--scene-ink)" />
      <path d="M330 276L339 266" stroke="var(--scene-line)" />
      <path d="M337 276L345 272L353 278L366 282Q369 285 365 286L355 284L361 289Q362 292 358 291L348 285L342 285Z" fill="#ca967a" stroke="#241c35" />
      <path d="M394 205Q402 202 407 216L418 251Q421 259 413 265L389 282L380 273L401 253L387 219" fill="var(--scene-paper)" stroke="var(--scene-ink)" />
      <path d="M386 267L395 278" stroke="var(--scene-line)" />
      <path d="M389 278L381 273L373 278L364 280Q361 282 364 284L373 282L367 287Q366 290 369 290L381 285L386 285Z" fill="#ca967a" stroke="#241c35" />

      {/* Left colleague: a three-quarter face and a naturally folded near arm. */}
      <path d="M186 232L184 249L198 259L211 245L205 229Z" fill="#ca967a" stroke="#241c35" />
      <path d="M183 246L169 252Q158 257 159 271L167 324Q185 336 212 324L211 278L218 260L207 246L198 255Z" fill="var(--scene-soft)" stroke="var(--scene-ink)" />
      <path d="M183 246L198 255L189 266L178 252M207 246L198 255L205 263L213 253M198 259L199 316" stroke="var(--scene-line)" strokeWidth="1.5" />
      <path d="M171 296L174 317M204 304L206 318" stroke="var(--scene-line)" />
      <path d="M205 259Q212 253 219 264L234 285L260 287L260 298L229 300Q224 300 221 295L205 279" fill="var(--scene-soft)" stroke="var(--scene-ink)" />
      <path d="M260 287L269 283L281 286Q284 288 281 290L273 289L280 292Q282 295 279 296L260 298Z" fill="#ca967a" stroke="#241c35" />
      <path d="M172 261Q179 256 185 268L199 297L239 304L237 316L193 310Q186 309 183 302L169 280" fill="var(--scene-soft)" stroke="var(--scene-ink)" />
      <path d="M231 303L229 314M184 293L188 298" stroke="var(--scene-line)" />
      <path d="M239 304L249 302L261 307Q264 310 260 311L251 308L257 313Q259 316 255 317L237 315Z" fill="#ca967a" stroke="#241c35" />
      <path d="M180 210Q180 195 196 194Q211 194 214 209L214 216L220 223L214 226L213 233Q209 243 198 240L188 233L185 223Q178 223 177 217Q176 211 180 210Z" fill="#ca967a" stroke="#241c35" />
      <path d="M181 214L184 218M205 211L209 212M205 231Q209 233 212 231" stroke="#241c35" strokeWidth="1.5" />
      <circle cx="209" cy="217" r="1.2" fill="#241c35" stroke="none" />
      <path d="M181 214L185 212L186 205Q192 206 197 202Q202 205 207 201L213 209Q219 204 215 198Q216 191 208 190Q204 184 197 188Q191 184 186 189Q179 188 176 195Q172 202 177 208Z" fill="#241c35" stroke="#241c35" />
      <path d="M183 196Q187 192 191 195M198 193Q202 190 206 194" stroke="#ca967a" strokeWidth="1.1" opacity="0.55" />

      {/* Right colleague: a different silhouette, tucked hair, and an open posture. */}
      <path d="M552 209Q564 201 572 209Q583 220 573 235Q568 242 570 253Q558 250 557 239Z" fill="#241c35" stroke="#241c35" />
      <path d="M537 230L534 246L546 257L558 248L553 228Z" fill="#e7ba96" stroke="#241c35" />
      <path d="M535 246L522 256Q516 262 519 276L523 322Q546 334 571 324L579 273Q580 259 566 253L556 246Q548 259 535 246Z" fill="var(--scene-accent)" stroke="var(--scene-ink)" />
      <path d="M535 248Q545 266 557 249M530 295L532 317M568 294L565 318" stroke="var(--scene-accent-soft)" strokeWidth="1.5" />
      <path d="M526 258Q518 255 512 266L499 286L477 288L478 299L504 300Q510 300 514 294L530 276" fill="var(--scene-accent)" stroke="var(--scene-ink)" />
      <path d="M477 288L468 284L457 288Q453 291 457 292L466 290L459 295Q457 298 461 298L478 299Z" fill="#e7ba96" stroke="#241c35" />
      <path d="M565 263Q557 258 551 270L536 299L501 307L503 319L542 312Q549 311 552 304L569 283" fill="var(--scene-accent)" stroke="var(--scene-ink)" />
      <path d="M510 305L512 316M547 296L543 302" stroke="var(--scene-accent-soft)" strokeWidth="1.5" />
      <path d="M501 307L492 305L480 311Q477 314 481 315L490 311L484 317Q483 320 487 320L503 318Z" fill="#e7ba96" stroke="#241c35" />
      <path d="M557 210Q558 194 542 192Q528 192 525 208L525 216L520 222L525 225L526 232Q530 241 541 239L550 232L553 223Q559 223 560 217Q561 212 557 210Z" fill="#e7ba96" stroke="#241c35" />
      <path d="M555 214L552 218M530 211L534 210M528 230Q531 233 535 231" stroke="#241c35" strokeWidth="1.5" />
      <circle cx="530" cy="216" r="1.2" fill="#241c35" stroke="none" />
      <path d="M557 215L552 211L550 200Q538 206 529 200L525 210Q520 203 524 196Q529 186 541 186Q555 186 561 197Q567 209 557 215Z" fill="#241c35" stroke="#241c35" />
      <path d="M533 193Q544 189 552 197M565 216Q573 223 566 234" stroke="#e7ba96" strokeWidth="1.1" opacity="0.5" />
      <circle cx="551" cy="225" r="2.3" fill="var(--scene-paper)" stroke="#241c35" strokeWidth="1.2" />
    </g>
  );
}
