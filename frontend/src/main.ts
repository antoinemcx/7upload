import { createApp } from "vue";

import { createRouter, createWebHistory } from "vue-router";
import { routes } from "vue-router/auto-routes";

import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

import "./style.css";

import App from "./App.vue";

import "@fontsource/roboto/100.css";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import "@fontsource/roboto/900.css";

import "@fontsource/roboto/100-italic.css";
import "@fontsource/roboto/300-italic.css";
import "@fontsource/roboto/400-italic.css";
import "@fontsource/roboto/500-italic.css";
import "@fontsource/roboto/700-italic.css";
import "@fontsource/roboto/900-italic.css";

const router = createRouter({
  history: createWebHistory(),
  routes,
});

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'light',
    themes: {
      light: {
        colors: {
          background: '#ebedf8',
          surface: '#f9f9ff',
          'surface-dim': '#d7dae4',
          'surface-bright': '#f9f9ff',
          'on-surface': '#181c23',
          outline: '#727786',
          'outline-variant': '#c1c6d7',
          primary: '#2B7FFF',
          'on-primary': '#ffffff',
          secondary: '#00658b',
          'on-secondary': '#ffffff',
          tertiary: '#6642d0',
          'on-tertiary': '#ffffff',
          error: '#ba1a1a',
          'on-error': '#ffffff',
          'surface-light': '#e6e8f2',
        },
        dark: false,
        variables: {
          'overlay-background': '#161b28',
        },
      },
      dark: {
        colors: {
          background: '#1c2027',
          surface: '#10131a',
          'surface-dim': '#10131a',
          'surface-bright': '#363941',
          'on-surface': '#e0e2ec',
          outline: '#8b90a0',
          'outline-variant': '#414754',
          primary: '#aec6ff',
          'on-primary': '#002e6b',
          secondary: '#7fd0ff',
          'on-secondary': '#00344a',
          tertiary: '#cdbdff',
          'on-tertiary': '#360096',
          error: '#ffb4ab',
          'on-error': '#690005',
          'surface-light': '#363941',
        },
        dark: true,
        variables: {
          'overlay-background': '#161b28',
        },
      },
    },
  },
})


createApp(App).use(router).use(vuetify).mount('#app')
