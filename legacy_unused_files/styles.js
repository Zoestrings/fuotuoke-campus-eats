export const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@600;700;800;900&family=Poppins:wght@300;400;500;600;700&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  html { scroll-behavior: smooth; }
  body { font-family: 'Poppins', sans-serif; background: #f4f6fb; color: #0d1b2a; overflow-x: hidden; }
  input:focus { outline: none; }
  a { text-decoration: none; color: inherit; }
  button { font-family: 'Poppins', sans-serif; }

  :root {
    --navy:        #0d1b2a;
    --navy2:       #1a3352;
    --navy3:       #0e2a45;
    --gold:        #c9980a;
    --gold2:       #a07808;
    --gold-light:  #fef9e7;
    --blue:        #1a4fd6;
    --blue-light:  #e8f0fe;
    --green:       #166534;
    --green-light: #dcfce7;
    --cream:       #f4f6fb;
    --border:      #dde3ed;
    --white:       #ffffff;
    --light:       #6b7a90;
    --red:         #dc2626;
  }

  @keyframes fadeDown { from { opacity: 0; transform: translateY(-18px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeUp   { from { opacity: 0; transform: translateY(22px);  } to { opacity: 1; transform: translateY(0); } }
  @keyframes slideR   { from { opacity: 0; transform: translateX(28px);  } to { opacity: 1; transform: translateX(0); } }

  .fd  { animation: fadeDown 0.55s ease both; }
  .fd2 { animation: fadeDown 0.55s 0.12s ease both; }
  .fd3 { animation: fadeDown 0.55s 0.22s ease both; }
  .fu  { animation: fadeUp   0.55s 0.3s  ease both; }
  .sr  { animation: slideR   0.45s ease both; }
`;
