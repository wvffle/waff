---
theme: default
class: 'text-center'
highlighter: shiki
lineNumbers: true
drawings:
  persist: false
css: unocss
---

# Projekt i implementacja JavaScriptowego frameworku frontendowego

<div class="abs-bl m-6 gap-2 text-left">
  Kasper Seweryn
  <div class="text-sm block">promotor: dr inż. Marek Tabędzki</div>
</div>

---
layout: cover
---

# Cel pracy

Celem pracy jest zaprojektowanie i stworzenie frameworku frontendowego opartego na języku programowania JavaScript tak aby posiadał wsparcie dla komponentów bazujących na plikach SFC przy pomocy prekompilacji, poprawnie aktualizował strukturę HTML oraz posiadał zaawansowany system reaktywności.

---
layout: cover
---

# Użyte technologie

<div class="flex gap-2 justify-center">
  <img src="/assets/vite.png" class="h-40" />
  <img src="/assets/ts.png" class="h-40" />
  <img src="/assets/snabbdom.png" class="h-40" />
  <img src="/assets/hast.png" class="h-40" />
</div>

---

# Z jakich komponentów składa sie framework?

Framework frontendowy składa sie z 5 głównych komponentów

- 🤹 **System reaktywności** - odpowiadają za aktualizacje HTMLa gdy stan w JSie sie zmieni
- 📝 **Logika komponentów** - odpowiada za poprawne renderowanie komponentów
- 🔌 **Pliki SFC** - odpowiadają za definicje komponentów
- 🛠 **Prekompilator komponentów** - odpowiada za kompilacje plików SFC
- 🎨 **Wtyczka do narzędzi do budowania** - odpowiada za wsparcie plików SFC w projektach

---
layout: cover
---

# System reaktywnosci

---

# System reaktywnosci
W momencie odczytywania wartości reaktywnej zmiennej oznaczamy ja jako śledzona przez dana funkcje, a w momencie zapisu wywołujemy wszystkie funkcje które śledzą ta zmienną.

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

# Logika komponentów

---

# Logika komponentów

Po aktualizacji stanu należy zaktualizować HTML

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
  document.querySelector('#count').textContent = value
})
```

---

# Logika komponentów

Co zrobić aby ułatwić użytkownikowi pisanie własnych komponentów? Jak mogłaby wyglądać struktura HTML takich komponentów?

```html
<button @click="--counter.value">--</button>
<div>{{ counter.value }}</div>
<button @click="++counter.value">++</button>
```


---

# Logika komponentow
Jak wyglądałaby JavasScriptowa reprezentacja komponentu?

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
Działanie defineComponent()

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
Pełna reprezentacja komponentu jest znacznie prostsza niz pisanie wszystkiego ręcznie.

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
Można uprościć go jeszcze bardziej rezygnując z ręcznego zarządzania reaktywnością w strukturze HTML i oddelegować to frameworkowi.

```vue {2,6-8|all}
<script>
const counter = ref(0)
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

# Prekompilator plików SFC
---

# Prekompilator plików SFC

<table>
  <tr>
    <th>Przed prekompilacją</th>
    <th>Po prekompilacji</th>
  </tr>
  <tr>
    <td>
```vue
<script>
const counter = ref(0)
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
const Counter = $defineComponent('Counter', {
  setup: () => ({
    counter: ref(0)
  }),
  render: (_, $data) => {
    const { counter } = $toRefs($data)
    return $createElement('div', {}, [
      $createElement('button', {
        on: { click: () => counter.value-- }
      }, [
        '--'
      ]),
      $createElement('div', {}, [
        counter.value
      ])
      $createElement('button', {
        on: { click: () => counter.value++ }
      }, [
        '++'
      ])
    ])
  }
})
```
    </td>
  </tr>
</table>

---
layout: cover
---

# Wtyczka do narzędzi do budowania

---

# Wtyczka do narzędzi do budowania

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
Dzięki wtyczce użytkownik nie musi męczyć sie z ręczną konfiguracją prekompilatora

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
todo-app.waff

```vue {all|3|5|7-8|10-13}
<script>
import { reactive, ref, watchEffect } from '@waff/core'
import TodoRenderer from './todo-renderer.waff'

type Todo = { text: string, done: boolean }

const todos = reactive([] as Todo[])
const todo = ref('test todo')

const addTodo = () => {
  todos.push({ text: todo.value, done: false })
  todo.value = ''
}
</script>
```
---

# Demo
todo-app.waff

```vue {all|7|11|12|17}
<template>
  <main class="flex justify-center items-center h-screen bg-green-200">
    <div class="max-w-md w-full shadow-md bg-white px-8 pb-16 pt-8 rounded-md">
      <h1 class="text-xl pb-4 text-gray-800">
        Things to do
        <div class="text-gray-500 text-sm">
          Number of todos: {{ todos.length }}
        </div>
      </h1>
      <div class="border border-gray-200 flex rounded focus-within:shadow overflow-hidden mb-8">
        <input @input="todo = $event.target.value" :value="todo" type="text" class="w-full px-4 py-2">
        <button @click="addTodo()" class="bg-green-500 hover:bg-green-400">
          <div class="i-clarity-add-text-line text-2xl text-white px-6"></div>
        </button>
      </div>

      <todo-renderer :todos="todos" />
    </div>
  </main>
</template>


```
---

# Demo
todo-renderer.waff
```ts
<script>
defineProps<{ todos: Todo[] }>()

const enumerate = <T>(arr: T[]) => Object.entries(arr)
  .map(([i, v]) => [+i, v]) as [number, T][]
</script>

```
---

# Demo
todo-renderer.waff
```vue {all|4|5|6|8|9-10|14}
<template>
  <table class="w-full">
    <tbody class="divide-y-1">
      <tr w-for="[i, todo] in enumerate(todos)">
        <td class="px-4 py-2 text-sm text-gray-400 align-middle">{{ i + 1 }}</td>
        <td class="px-4 py-2 w-full" :class="{ 'line-through text-gray-400': todo.done }">{{ todo.text }}</td>
        <td class="px-4 py-2">
          <button @click="todo.done = !todo.done" class="flex">
            <div w-if="!todo.done" class="i-bi-circle text-2xl text-gray-400 hover:text-green-400 self-center"></div>
            <div w-else class="i-bi-check-circle text-2xl hover:text-green-400 text-green-500 self-center"></div>
          </button>
        </td>
        <td class="px-4 py-2">
          <button @click="todos.splice(i, 1)" class="flex">
            <div class="i-bi-trash text-2xl hover:text-red-400 text-red-500 self-center"></div>
          </button>
        </td>
      </tr>
    </tbody>
  </table>
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

Aplikacja posiada 85 testów jednostkowych sprawdzających poprawność wygenerowanego kodu, jak i reaktywności

---
layout: cover
---

# Podsumowanie

Cel został osiągnięty w 100%. Framework posiada wsparcie dla komponentów bazujących na plikach SFC dzięki prekompilacji, poprawnie aktualizuje strukturę HTML oraz posiada zaawansowany system reaktywności.

---
layout: cover
---

# Kierunki rozwoju

- **HMR** - Podmienianie zaktualizowanych modułów w czasie rzeczywistym
- **Router** - Wyświetlanie zdefiniowanych przez użytkownika stron na bazie adresu URL
- **SSG** - Generowanie statycznych plików HTML dla odpowiednich stron
- **SSR** - Dynamiczne renderowanie stron po stronie serwera
- **Wsparcie IDE** - Dodatek do VS Codium dodający kolorowanie składni i pokazujący błędy TS

---
layout: center
---

# Dziekuje za uwage
