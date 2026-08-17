Simple top nav — logo, 2-3 text links, optional CTA button. Matches the silstone.ai header (Home / Blog / Contact).

```jsx
<NavBar
  logo={<img src="assets/logo-mark.png" height={28} />}
  links={[{label:'Home',href:'/'},{label:'Blog',href:'/blog-list'},{label:'Contact',href:'/contact'}]}
  cta={<Button variant="secondary" size="sm">Book a call</Button>}
/>
```
