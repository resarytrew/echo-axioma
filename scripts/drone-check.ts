import { simulateRoute } from "../src/game/drone";

const r = (n: string, s: {x:number;y:number}[]) => {
  const res = simulateRoute(s);
  console.log(n.padEnd(12), { reached: res.reached, collisionAt: res.collisionAt, oob: res.outOfBounds, len: +res.length.toFixed(1), passed: res.passed });
};

r("straight", [{x:2,y:1.5},{x:2,y:1.5},{x:2,y:1.5},{x:2,y:1.5}]);
r("northlane", [
  {x:1.9,y:0},{x:1.9,y:0},{x:1.9,y:0},{x:1.8,y:0.6},{x:0.5,y:1.9},{x:0,y:1.9},{x:0,y:1.6},
]);
r("oob", [{x:-2,y:-2},{x:-2,y:-2}]);
