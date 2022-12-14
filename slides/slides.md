---
theme: default
class: 'text-center'
highlighter: shiki
lineNumbers: true
drawings:
  persist: false
css: unocss
---

# Projekt i implementacja javascriptowego frameworku frontendowego

<div class="abs-bl m-6 gap-2 text-left">
  Kasper Seweryn
  <div class="text-sm block">promotor: dr inż. Marek Tabędzki</div>
</div>

---
layout: cover
---

# Cel pracy

Celem pracy jest zaprojektowanie i stworzenie frameworku frontendowego opartego na jezyku programowania JavaScript tak aby posiadal wsparcie dla komponentow bazujacych na plikach SFC przy pomocy prekompilacji, poprawnie aktualizowal strukture HTML oraz posiadal zaawansowany system reaktywnosci.

---
layout: cover
---

# Uzyte technologie

<div class="flex gap-2 justify-center">
  <img src="/assets/vite.png" class="h-40" />
  <img src="/assets/ts.png" class="h-40" />
  <img src="/assets/snabbdom.png" class="h-40" />
  <img src="/assets/hast.png" class="h-40" />
</div>

---

# Z jakich komponentow sklada sie framework?

Framework frontendowy sklada sie z 5 glownych komponentow

- 🤹 **System reaktywnosci** - odpowiadaja za aktualizacje HTMLa gdy stan w JSie sie zmieni
- 📝 **Logika komponentow** - odpowiada za poprawne renderowanie komponentow
- 🔌 **Pliki SFC** - odpowiadaja za definicje komponentow
- 🛠 **Prekompilator komponentow** - odpowiada za kompilacje plikow SFC
- 🎨 **Wtyczka do narzedzi do budowania** - odpowiada za wsparcie plikow SFC w projektach

---
layout: cover
---

# System reaktywnosci

---

# System reaktywnosci
W momencie odczytywania wartosci reaktywnej zmiennej oznaczamy ja jako sledzona przez dana funkcje, a w momencie zapisu wywolujemy wszystkie funkcje ktore sledza ta zmienna.

```ts {1|3-5|7|4,7|8|9|all}
const counter = ref(0)

watch(counter, (value) => {
  console.log(value)
})

counter.value = 7 // 7
counter.value++ // 8
counter.value = 9 // 9
```
---
layout: cover
---

# Logika komponentow

---

# Logika komponentow

Po aktualizacji stanu nalezy zaktualizowac HTML

```html
<button id="dec">--</button>
<div id="count">0</div>
<button id="inc">++</button>
```

```ts {none|1|3-5|6-8|all}
const counter = ref(0)

document.querySelector('#inc').addEventListener('click', () => ++counter.value)
document.querySelector('#dec').addEventListener('click', () => --counter.value)

watch(counter, (value) => {
  document.querySelector('#dec').textContent = value
})
```

---

# Logika komponentow

Co zrobic aby ulatwic uzytkownikowi pisanie wlasnych komponentow? Jak moglyby wygladac struktura HTML takich komponentow?

```html
<button @click="--counter.value">--</button>
<div>{{ counter.value }}</div>
<button @click="++counter.value">++</button>
```


---

# Logika komponentow
Jak wygladalaby javascriptowa reprezentacja komponentu?

```ts {1,20|2-4|5,19|6,10|7|9|6-10|14-18|11-13|all}
const Counter = defineComponent('Counter', {
  setup: () => ({
    counter: ref(0)
  }),
  render: (_, data) => createElement('div', {}, [
    createElement('button', {
      on: { click: () => data.counter.value-- }
    }, [
      '--'
    ]),
    createElement('div', {}, [
      data.counter.value
    ])
    createElement('button', {
      on: { click: () => data.counter.value++ }
    }, [
      '++'
    ])
  ])
})
```
---

# Logika komponentow
Dzialanie defineComponent()

```ts {1,8|2|4,7|5|6|all}
const defineComponent = (_, options) => () => {
  const data = options.setup()

  watchEffect(() => {
    const element = options.render(_, data)
    patchRootElement(element)
  })
}
```
---
layout: cover
---

# Pliki SFC

---

# Pliki SFC
Pelna reprezentacja komponentu jest znacznie prostsza niz pisanie wszystkiego recznie.

```vue {all|1-3|6-8}
<script>
const counter = ref(0)
</script>

<template>
  <button @click="--counter.value">--</button>
  <div>{{ counter.value }}</div>
  <button @click="++counter.value">++</button>
</template>
```

---

# Pliki SFC
Mozna uproscic go jeszcze bardziej rezygnujac z recznego zarzadzania reaktywnoscia i oddelegowujac to frameworkowi.

```vue {2,6-8|all}
<script>
let counter = 0
</script>

<template>
  <button @click="--counter">--</button>
  <div>{{ counter }}</div>
  <button @click="++counter">++</button>
</template>
```

---
layout: cover
---

# Prekompilator plikow SFC
---

# Prekompilator plikow SFC

<table>
  <tr>
    <th>Przed prekompilacja</th>
    <th>Po prekompilacji</th>
  </tr>
  <tr>
    <td>
```vue
<script>
let counter = 0
</script>

<template>
  <button @click="--counter">--</button>
  <div>{{ counter }}</div>
  <button @click="++counter">++</button>
</template>
```
    </td>
    <td>

```ts
const Counter = defineComponent('Counter', {
  setup: () => ({
    counter: ref(0)
  }),
  render: (_, data) => createElement('div', {}, [
    createElement('button', {
      on: { click: () => data.counter.value-- }
    }, [
      '--'
    ]),
    createElement('div', {}, [
      data.counter.value
    ])
    createElement('button', {
      on: { click: () => data.counter.value++ }
    }, [
      '++'
    ])
  ])
})
```
    </td>
  </tr>
</table>

---
layout: cover
---

# Wtyczka do narzedzi do budowania

---

# Wtyczka do narzedzi do budowania

<img src="/assets/vite.png" class="h-40 mx-auto" />

```ts {all|2}
import { createApp } from '@waff/core'
import Counter from './components/Counter.waff'

createApp({
  root: document.querySelector('#app'),
  component: Counter(),
})
```

---

# Wtyczka do narzedzi do budowania
Dzieki wtyczce uzytkownik nie musi meczyc sie z prekompilatorem

```ts
// vite.config.ts
import { defineConfig } from 'vite'
import waff from '@waff/vite'

export default defineConfig({
  plugins: [
    waff()
  ]
})

```

---
layout: cover
---

# Demo

---

# Demo

```vue {all|12-14}
<script>
let counter = 0
</script>

<template>
    <h1>Awesome counter</h1>

    <button @click="counter -= 1">--</button>
    <span>{{ counter }}</span>
    <button @click="++counter">++</button>

    <p w-if="counter > 0">YAY</p>
    <p w-else-if="counter < 0">NAY</p>
    <p w-else>MEH</p>
</template>

```

---
layout: cover
---

# Demo

<video src="/assets/demo.webm" class="h-40" controls />

---
layout: cover
---

# Testy

Aplikacja posiada 85 testow jednostkowych sprawdzajacych poprawnosc wygenerowanego kodu, jak i reaktywnosci

---
layout: cover
---

# Podsumowanie

Cel zostal osiagniety w 100%. Framework posiada wsparcie dla komponentow bazujacych na plikach SFC dzieki prekompilacji, poprawnie aktualizuje strukture HTML oraz posiada zaawansowany system reaktywnosci.

---
layout: cover
---

# Kierunki rozwoju

- **HMR** - Podmienianie zaktualizowanych modulow w czasie rzeczywistym
- **Router** - Wyswietlanie zdefiniowanych przez uzytkownika stron na bazie adresu URL
- **SSG** - Generowanie statycznych plikow HTML dla odpowiednich stron
- **SSR** - Dynamiczne renderowanie stron po stronie serwera

---
layout: center
---

# Dziekuje za uwage
