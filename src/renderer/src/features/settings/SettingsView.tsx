import type { ChangeEvent } from 'react'
import type { AppSettings, DistanceUnit, ThemeMode } from '@shared/models/settings'
import { ViewHeader } from '../../components/common/ViewHeader'
import { SettingRow } from '../../components/ui/SettingRow'
import { Toggle } from '../../components/ui/Toggle'
import { useSettingsStore } from '../../state/settingsStore'

/**
 * Settings. Grouped into clear sections and persisted immediately on change via
 * the settings store, which round-trips to the main process.
 */
export function SettingsView(): JSX.Element {
  const settings = useSettingsStore((s) => s.settings)
  const update = useSettingsStore((s) => s.update)

  const set = <K extends keyof AppSettings>(key: K, value: AppSettings[K]): void => {
    void update({ [key]: value } as Partial<AppSettings>)
  }

  return (
    <div className="h-full overflow-y-auto">
      <ViewHeader title="Settings" subtitle="Tune EarthScope to the way you work." />

      <div className="mx-auto max-w-2xl space-y-8 px-8 pb-12">
        <SettingsSection title="Data">
          <SettingRow
            title="Auto-refresh interval"
            description="How often EarthScope checks for new events."
          >
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
        </SettingsSection>

        <SettingsSection title="Appearance">
          <SettingRow title="Theme" description="Dark is the default and recommended.">
            <Segmented<ThemeMode>
              value={settings.theme}
              onChange={(v) => set('theme', v)}
              options={[
                { value: 'dark', label: 'Dark' },
                { value: 'light', label: 'Light' },
                { value: 'system', label: 'System' }
              ]}
            />
          </SettingRow>
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
          <SettingRow
            title="Animation speed"
            description="Global multiplier for event and UI motion."
          >
            <RangeControl
              min={0}
              max={2}
              step={0.25}
              value={settings.animationSpeed}
              onChange={(v) => set('animationSpeed', v)}
              format={(v) => (v === 0 ? 'Off' : `${v}×`)}
            />
          </SettingRow>
        </SettingsSection>

        <SettingsSection title="Globe">
          <SettingRow title="Atmosphere glow" description="Soft halo around the planet.">
            <Toggle
              label="Atmosphere glow"
              checked={settings.showAtmosphere}
              onChange={(v) => set('showAtmosphere', v)}
            />
          </SettingRow>
          <SettingRow title="Idle auto-rotation" description="Gently spin the globe when idle.">
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
        </SettingsSection>

        <SettingsSection title="Notifications">
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
        </SettingsSection>

        <SettingsSection title="Privacy">
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
        </SettingsSection>
      </div>
    </div>
  )
}

function SettingsSection({
  title,
  children
}: {
  title: string
  children: React.ReactNode
}): JSX.Element {
  return (
    <section>
      <h2 className="mb-1 text-2xs font-semibold uppercase tracking-wider text-content-tertiary">
        {title}
      </h2>
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
      className="h-9 rounded-lg border border-surface-border bg-surface-base px-3 text-sm text-content-primary focus:border-accent/50"
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
    <div className="flex rounded-lg border border-surface-border bg-surface-base p-0.5">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => onChange(option.value)}
          data-active={value === option.value}
          className="rounded-md px-3 py-1 text-xs font-medium text-content-secondary transition-colors data-[active=true]:bg-surface-hover data-[active=true]:text-content-primary"
        >
          {option.label}
        </button>
      ))}
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
        className="w-32 accent-accent"
      />
      <span className="w-10 text-right text-xs tabular-nums text-content-secondary">
        {format(value)}
      </span>
    </div>
  )
}
