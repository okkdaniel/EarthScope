import type { ChangeEvent } from 'react'
import type { AppSettings, DistanceUnit, ThemeMode } from '@shared/models/settings'
import { ViewHeader } from '../../components/common/ViewHeader'
import { SettingRow } from '../../components/ui/SettingRow'
import { Toggle } from '../../components/ui/Toggle'
import { Eyebrow } from '../../components/editorial/Eyebrow'
import { useSettingsStore } from '../../state/settingsStore'
import { cn } from '../../utils/cn'

/**
 * Settings. Grouped into ruled sections with editorial controls — hairline
 * selects, ink toggles, underlined segment choices. Persisted on change.
 */
export function SettingsView(): JSX.Element {
  const settings = useSettingsStore((s) => s.settings)
  const update = useSettingsStore((s) => s.update)

  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K]): void => {
    void update({ [key]: value } as Partial<AppSettings>)
  }

  return (
    <div className="h-full overflow-y-auto">
      <ViewHeader eyebrow="Preferences" title="Settings" subtitle="Tune EarthScope to the way you work." />

      <div className="mx-auto max-w-2xl space-y-12 px-10 pb-16 pt-10">
        <Section title="Data">
          <SettingRow title="Auto-refresh interval" description="How often EarthScope checks for new events.">
            <NumberSelect
              value={settings.refreshIntervalMinutes}
              onChange={(v) => set('refreshIntervalMinutes', v)}
              options={[
                { value: 0, label: 'Manual only' },
                { value: 5, label: 'Every 5 min' },
                { value: 15, label: 'Every 15 min' },
                { value: 30, label: 'Every 30 min' },
                { value: 60, label: 'Every hour' }
              ]}
            />
          </SettingRow>
          <SettingRow title="Cache size" description="Maximum on-disk cache for offline mode.">
            <NumberSelect
              value={settings.cacheSizeMb}
              onChange={(v) => set('cacheSizeMb', v)}
              options={[
                { value: 25, label: '25 MB' },
                { value: 50, label: '50 MB' },
                { value: 100, label: '100 MB' },
                { value: 250, label: '250 MB' }
              ]}
            />
          </SettingRow>
        </Section>

        <Section title="Appearance">
          <SettingRow title="Units" description="Distance and measurement units.">
            <Segmented<DistanceUnit>
              value={settings.units}
              onChange={(v) => set('units', v)}
              options={[
                { value: 'metric', label: 'Metric' },
                { value: 'imperial', label: 'Imperial' }
              ]}
            />
          </SettingRow>
          <SettingRow title="Theme" description="EarthScope uses a single warm editorial palette.">
            <Segmented<ThemeMode>
              value={settings.theme}
              onChange={(v) => set('theme', v)}
              options={[
                { value: 'light', label: 'Paper' },
                { value: 'system', label: 'System' }
              ]}
            />
          </SettingRow>
          <SettingRow title="Animation speed" description="Global multiplier for event and UI motion.">
            <RangeControl
              min={0}
              max={2}
              step={0.25}
              value={settings.animationSpeed}
              onChange={(v) => set('animationSpeed', v)}
              format={(v) => (v === 0 ? 'Off' : `${v}×`)}
            />
          </SettingRow>
        </Section>

        <Section title="Globe">
          <SettingRow title="Graticule" description="Faint latitude / longitude survey lines.">
            <Toggle
              label="Graticule"
              checked={settings.showAtmosphere}
              onChange={(v) => set('showAtmosphere', v)}
            />
          </SettingRow>
          <SettingRow title="Idle auto-rotation" description="Gently rotate the globe when idle.">
            <RangeControl
              min={0}
              max={1}
              step={0.05}
              value={settings.globeAutoRotate}
              onChange={(v) => set('globeAutoRotate', v)}
              format={(v) => (v === 0 ? 'Off' : v.toFixed(2))}
            />
          </SettingRow>
          <SettingRow title="Camera sensitivity" description="Rotation and zoom responsiveness.">
            <RangeControl
              min={0.25}
              max={2}
              step={0.25}
              value={settings.cameraSensitivity}
              onChange={(v) => set('cameraSensitivity', v)}
              format={(v) => `${v}×`}
            />
          </SettingRow>
        </Section>

        <Section title="Notifications">
          <SettingRow
            title="Desktop notifications"
            description="Alert me when notable new events are detected."
          >
            <Toggle
              label="Desktop notifications"
              checked={settings.notificationsEnabled}
              onChange={(v) => set('notificationsEnabled', v)}
            />
          </SettingRow>
        </Section>

        <Section title="Privacy">
          <SettingRow
            title="Anonymous telemetry"
            description="Disabled by default. Helps improve EarthScope. No personal data."
          >
            <Toggle
              label="Anonymous telemetry"
              checked={settings.telemetryEnabled}
              onChange={(v) => set('telemetryEnabled', v)}
            />
          </SettingRow>
        </Section>
      </div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }): JSX.Element {
  return (
    <section>
      <Eyebrow className="mb-1 border-b border-surface-border pb-2">{title}</Eyebrow>
      <div className="divide-y divide-surface-border">{children}</div>
    </section>
  )
}

function NumberSelect({
  value,
  onChange,
  options
}: {
  value: number
  onChange: (value: number) => void
  options: { value: number; label: string }[]
}): JSX.Element {
  return (
    <select
      value={value}
      onChange={(e: ChangeEvent<HTMLSelectElement>) => onChange(Number(e.target.value))}
      className="cursor-pointer appearance-none border-b border-content-primary bg-transparent pb-0.5 pr-4 text-sm text-content-primary"
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  )
}

function Segmented<T extends string>({
  value,
  onChange,
  options
}: {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
}): JSX.Element {
  return (
    <div className="flex items-baseline gap-4">
      {options.map((option) => {
        const active = value === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'text-xs uppercase tracking-meta hover-fade',
              active
                ? 'border-b border-content-primary pb-0.5 text-content-primary'
                : 'text-content-secondary'
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

function RangeControl({
  min,
  max,
  step,
  value,
  onChange,
  format
}: {
  min: number
  max: number
  step: number
  value: number
  onChange: (value: number) => void
  format: (value: number) => string
}): JSX.Element {
  return (
    <div className="flex items-center gap-3">
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-32 accent-content-primary"
      />
      <span className="tabular w-10 text-right text-xs text-content-secondary">{format(value)}</span>
    </div>
  )
}
