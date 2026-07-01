import { Globe2, Github, ExternalLink } from 'lucide-react'
import { ViewHeader } from '../../components/common/ViewHeader'
import { useAppInfo } from '../../hooks/useAppInfo'

/**
 * About & attribution. Credits the NASA EONET data source, as required for
 * responsible use of the API, and surfaces runtime versions for support.
 */
export function AboutView(): JSX.Element {
  const info = useAppInfo()

  return (
    <div className="h-full overflow-y-auto">
      <ViewHeader title="About" />

      <div className="mx-auto max-w-2xl space-y-6 px-8 pb-12">
        <div className="panel flex items-center gap-4 p-6">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/15">
            <Globe2 className="h-7 w-7 text-accent" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-content-primary">EarthScope</h2>
            <p className="text-sm text-content-secondary">
              Explore real-time natural events across Earth.
            </p>
            <p className="mt-1 text-xs text-content-tertiary">
              Version {info?.version ?? '—'}
            </p>
          </div>
        </div>

        <section className="panel p-6">
          <h3 className="mb-2 text-sm font-semibold text-content-primary">Data & attribution</h3>
          <p className="text-sm leading-relaxed text-content-secondary">
            Event data is provided by NASA&apos;s Earth Observatory Natural Event Tracker (EONET).
            EarthScope is an independent project and is not affiliated with or endorsed by NASA.
          </p>
          <a
            href="https://eonet.gsfc.nasa.gov"
            target="_blank"
            rel="noreferrer"
            className="mt-3 inline-flex items-center gap-1.5 text-xs text-accent hover:text-accent/80"
          >
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={1.75} />
            eonet.gsfc.nasa.gov
          </a>
        </section>

        <section className="panel p-6">
          <h3 className="mb-3 text-sm font-semibold text-content-primary">Runtime</h3>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-2 text-xs">
            <InfoRow label="Platform" value={info?.platform ?? '—'} />
            <InfoRow label="Electron" value={info?.electron ?? '—'} />
            <InfoRow label="Chromium" value={info?.chrome ?? '—'} />
            <InfoRow label="Node" value={info?.node ?? '—'} />
          </dl>
        </section>

        <a
          href="https://github.com/earthscope-app/earthscope"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 text-xs text-content-secondary hover:text-content-primary"
        >
          <Github className="h-4 w-4" strokeWidth={1.75} />
          View source on GitHub
        </a>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="flex justify-between border-b border-surface-border/60 py-1.5">
      <dt className="text-content-tertiary">{label}</dt>
      <dd className="selectable font-mono text-content-secondary">{value}</dd>
    </div>
  )
}
