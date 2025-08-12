import React, { useState } from "react";

import { PageTransition } from "../components/Transitions/PageTransition";
import Button from "../components/ui/Button";
import Card from "../components/ui/Card";

export default function Settings() {
  const [theme, setTheme] = useState("light");

  return (
    <PageTransition type="fade">
      <div className="space-y-6 page-enter">
        <div className="text-center fade-in">
          <h1 className="text-2xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Customize your Codie experience and preferences
          </p>
        </div>
        <Card className="card-elevate fade-in">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Appearance
          </h3>
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Theme
            </label>
            <select
              aria-label="Theme selector"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md bg-input text-foreground input-focus-anim"
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="auto">Auto</option>
            </select>
          </div>
        </Card>
        <div className="flex gap-4 justify-center">
          <Button className="btn-anim">💾 Save Settings</Button>
          <Button variant="outline" className="btn-anim">🔄 Reset</Button>
        </div>
      </div>
    </PageTransition>
  );
}
