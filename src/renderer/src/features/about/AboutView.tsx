import { ViewHeader } from '../../components/common/ViewHeader'
import { SectionHeading } from '../../components/editorial/SectionHeading'
import { EditorialLink } from '../../components/editorial/EditorialLink'
import { Eyebrow } from '../../components/editorial/Eyebrow'
import { ContourMark } from '../../components/editorial/ContourMark'
import { AnuraLogo } from '../../components/editorial/AnuraLogo'
import { useAppInfo } from '../../hooks/useAppInfo'

/**
 * About & attribution. Credits the NASA EONET data source (required for
 * responsible API use) and lists runtime versions, set as an editorial spread.
 */
export function AboutView(): JSX.Element {
  const info = useAppInfo()

  return (
    <div className="relative h-full overflow-y-auto overflow-x-clip">
      <ContourMark
        className="absolute bottom-0 left-0 w-[680px]"
        style={{ transform: 'translate(-26%, 30%)' }}
      />

      <ViewHeader eyebrow="Colophon" title="About" />

      <div className="relative mx-auto max-w-2xl space-y-14 px-10 pb-16 pt-10">
        <section>
          <AnuraLogo size={56} className="mb-6" />
          <h2 className="display text-5xl leading-none tracking-display-tight text-content-primary">
            EarthScope
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-content-secondary">
            A desktop instrument for exploring real-time natural events across Earth, built by
            Anura.
          </p>
          <Eyebrow className="mt-4">Version {info?.version ?? '—'}</Eyebrow>
        </section>

        <section>
          <SectionHeading>Data &amp; attribution</SectionHeading>
          <p className="max-w-lg text-sm leading-relaxed text-content-secondary">
            Event data is provided by NASA&apos;s Earth Observatory Natural Event Tracker (EONET).
            EarthScope is an independent project and is not affiliated with or endorsed by NASA.
          </p>
          <div className="mt-4">
            <EditorialLink href="https://eonet.gsfc.nasa.gov" target="_blank" rel="noreferrer" arrow>
              eonet.gsfc.nasa.gov
            </EditorialLink>
          </div>
        </section>

        <section>
          <SectionHeading>Runtime</SectionHeading>
          <dl className="grid grid-cols-2 gap-x-12 gap-y-2.5 text-sm">
            <InfoRow label="Platform" value={info?.platform ?? '—'} />
            <InfoRow label="Electron" value={info?.electron ?? '—'} />
            <InfoRow label="Chromium" value={info?.chrome ?? '—'} />
            <InfoRow label="Node" value={info?.node ?? '—'} />
          </dl>
        </section>

        <section>
          <EditorialLink
            href="https://github.com/earthscope-app/earthscope"
            target="_blank"
            rel="noreferrer"
            quiet
            arrow
          >
            View source on GitHub
          </EditorialLink>
        </section>
      </div>
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }): JSX.Element {
  return (
    <div className="flex items-baseline justify-between border-b border-surface-border py-2">
      <dt className="text-content-secondary">{label}</dt>
      <dd className="selectable tabular font-mono text-xs text-content-primary">{value}</dd>
    </div>
  )
}
