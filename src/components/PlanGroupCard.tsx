/**
 *  PlanGroupCard.tsx
 *
 *  One group on the groups page, as a card in the same style as the plan and cohort cards. Its
 *  students are compact cards on the left. On the right is the group's shared time on a little
 *  weekend calendar, with the days available, and a globe with a colored dot for each city the
 *  group's students are from, with a key of the countries.
 *
 *  @copyright 2026 Digital Aid Seattle
 *
 */
import { MoreOutlined } from "@ant-design/icons";
import { Box, Card, CardContent, IconButton, Paper, Stack, Typography } from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { Group, Placement } from "../api/types";
import { UI_STRINGS } from "../constants";
import { FacilitatorMenu } from "../pages/plan/FacilitatorMenu";
import { Place, placeKey } from "../services/geo/cityCoordinates";
import { usePlaceCoordinates } from "../services/geo/usePlaceCoordinates";
import { byAnchorThenName, countriesOf, genderSplit } from "../services/plan/groupFit";
import { GLOBE_BACKDROP, GLOBE_DOT_EDGE, globeColor } from "../utils/globeColors";
import { raisedCardSx } from "../utils/styles";
import { describeDays, gridHours, toWeekendSegments } from "../utils/weekendGrid";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import { Globe, GlobePoint } from "./Globe";
import { GroupSummary } from "./GroupSummary";
import { PlanStudentCard } from "./PlanStudentCard";
import { normalizeCountryName } from "../utils/countryFlag";

/**
 * A titled container for one part of the card. `aside` is a line at the right of the title, which drops under it when there is
 * no room. `dark` makes it charcoal with a white title, as behind the globe. `fill` has the contents grow to the container's height.
 */
const Section: React.FC<{
    title: string, part: string, aside?: React.ReactNode, dark?: boolean, fill?: boolean, sx?: object, children: React.ReactNode
}> = ({ title, part, aside, dark, fill, sx, children }) => (
    <Paper
        variant="outlined"
        component="section"
        aria-label={title}
        data-part={part}
        sx={{
            p: 1.5,
            minWidth: 0,
            display: 'flex',
            flexDirection: 'column',
            ...(dark && { bgcolor: GLOBE_BACKDROP, borderColor: GLOBE_BACKDROP, color: '#fff' }),
            ...sx
        }}>
        <Stack direction="row" justifyContent="space-between" alignItems="baseline" flexWrap="wrap" columnGap={2} sx={{ mb: 1 }}>
            <Typography variant="subtitle2" component="h4" sx={{ fontWeight: 600 }}>{title}</Typography>
            {aside && <Typography variant="body2" color={dark ? 'inherit' : 'text.secondary'}>{aside}</Typography>}
        </Stack>
        <Box sx={fill ? { flex: 1, minHeight: 0 } : undefined}>{children}</Box>
    </Paper>
);

/** How big the globe is drawn. */
const GLOBE_SIZE = 132;

export type PlanGroupCardProps = {
    group: Group,
    /** the students in the group */
    placements: Placement[],
    onSeeDetails: (placement: Placement) => void,
    onChangeGroup: (placement: Placement) => void,
    onToggleAnchor: (placement: Placement) => void
};

export const PlanGroupCard: React.FC<PlanGroupCardProps> = ({ group: initial, placements, onSeeDetails, onChangeGroup, onToggleAnchor }) => {
    // the facilitator menu hands back the changed group, which is shown until the plan next reloads
    const [group, setGroup] = useState<Group>(initial);
    useEffect(() => { setGroup(initial); }, [initial]);
    const [menuAnchor, setMenuAnchor] = useState<HTMLElement | null>(null);

    const members = useMemo(() => [...placements].sort(byAnchorThenName), [placements]);
    const countries = useMemo(() => countriesOf(members), [members]);
    const gender = useMemo(() => genderSplit(members), [members]);
    const facilitators = (group.assignments ?? []).map(assignment => assignment.facilitator?.name).filter(Boolean).join(', ');

    const segments = toWeekendSegments(group.time_windows);
    const sharedHours = gridHours(group.time_windows);

    // one dot for each distinct city, in the color of its country
    const places = useMemo(
        () => members.map(member => ({ city: member.student?.city, state: member.student?.state, country: member.student?.country }) as Place),
        [members]);
    const { coordinates, missing, loading } = usePlaceCoordinates(places);
    const points: GlobePoint[] = useMemo(() => {
        const byKey = new Map<string, GlobePoint>();
        places.forEach(place => {
            const key = placeKey(place);
            const at = coordinates.get(key);
            if (at && !byKey.has(key)) {
                const country = countries.find(c => normalizeCountryName(c) === normalizeCountryName(place.country ?? '')) ?? place.country ?? '';
                byKey.set(key, {
                    id: key,
                    lat: at.lat,
                    lng: at.lng,
                    color: globeColor(country, countries),
                    label: [place.city?.trim(), place.country?.trim()].filter(Boolean).join(', ')
                });
            }
        });
        return Array.from(byKey.values());
    }, [places, coordinates, countries]);
    const countryCounts = countries.map(country => ({
        country,
        count: members.filter(member => normalizeCountryName(member.student?.country ?? '') === normalizeCountryName(country)).length
    }));

    return (
        <Card sx={raisedCardSx} component="article" aria-label={group.name}>
            <CardContent>
                <Stack gap={2}>
                    <Stack direction="row" alignItems="flex-start" flexWrap="wrap" columnGap={1.5} rowGap={0.5}>
                        <Box sx={{ flexShrink: 0 }}>
                            <Typography variant="h3" component="h3" sx={{ fontWeight: 600 }}>{group.name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {facilitators ? `${UI_STRINGS.FACILITATOR_LABEL}: ${facilitators}` : UI_STRINGS.NO_FACILITATOR}
                            </Typography>
                        </Box>
                        <Stack direction="row" gap={0.75} flexWrap="wrap" alignItems="center" sx={{ ml: 'auto', pt: 0.5 }}>
                            <IconButton
                                size="small"
                                aria-label={`Group actions for ${group.name}`}
                                aria-haspopup="menu"
                                onClick={(event) => setMenuAnchor(event.currentTarget)}>
                                <MoreOutlined />
                            </IconButton>
                        </Stack>
                    </Stack>
                    <FacilitatorMenu
                        anchorElement={menuAnchor}
                        group={group}
                        onChange={(updated) => { if (updated) { setGroup(updated); } setMenuAnchor(null); }} />

                    {/* Location, Shared time and the summary, each in its own container, side by side while there is room */}
                    <Box data-part="summary-row" sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'stretch', gap: 2 }}>
                        <Section title={UI_STRINGS.DETAILS_LOCATION} part="location" dark sx={{ flex: '0 1 auto', maxWidth: '100%' }}>
                            {/* the globe, with the key of countries to the right of it in a white container; the key drops below when there is no room */}
                            <Stack direction="row" alignItems="flex-start" flexWrap="wrap" columnGap={2} rowGap={1}>
                                <Globe size={GLOBE_SIZE} label={`${group.name} cities`} points={points} />
                                <Box data-part="legend" sx={{ bgcolor: '#fff', color: 'text.primary', borderRadius: 1, px: 1.25, py: 1, minWidth: 0 }}>
                                    <Box component="ul" aria-label={`${group.name} countries`} sx={{ listStyle: 'none', m: 0, p: 0 }}>
                                        {countryCounts.map(({ country, count }) =>
                                            <Box component="li" key={country} sx={{ display: 'flex', alignItems: 'center', gap: 0.75, py: 0.125 }}>
                                                <Box aria-hidden="true" sx={{ width: 10, height: 10, borderRadius: '50%', flexShrink: 0, bgcolor: globeColor(country, countries), border: `1px solid ${GLOBE_DOT_EDGE}` }} />
                                                <Typography variant="body2" noWrap>{country} <strong>{count}</strong></Typography>
                                            </Box>
                                        )}
                                    </Box>
                                    {(loading || missing > 0) &&
                                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                                            {loading ? UI_STRINGS.LOADING_PLACES : `${missing} ${missing === 1 ? 'city' : 'cities'} ${UI_STRINGS.CITIES_NOT_PLACED}`}
                                        </Typography>}
                                </Box>
                            </Stack>
                        </Section>

                        <Section
                            title={UI_STRINGS.GROUP_SHARED_TIME}
                            part="shared-time"
                            aside={<>{UI_STRINGS.GROUP_DAYS_AVAILABLE}: <strong>{describeDays(segments)}</strong></>}
                            fill
                            sx={{ flex: '1 1 200px', maxWidth: 320 }}>
                            <AvailabilityCalendar
                                fill
                                size="compact"
                                label={`${group.name} shared time`}
                                highlight={group.time_windows ?? []}
                                noneLabel={UI_STRINGS.NO_SHARED_TIME} />
                        </Section>

                        <GroupSummary
                            studentCount={members.length}
                            countryCount={countries.length}
                            sharedHours={sharedHours}
                            gender={gender}
                            sx={{ flex: '1 1 220px' }} />
                    </Box>

                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))', gap: 1 }}>
                        {members.length === 0 &&
                            <Typography color="text.secondary" sx={{ gridColumn: '1 / -1' }}>{UI_STRINGS.GROUP_EMPTY}</Typography>}
                        {members.map(member =>
                            <PlanStudentCard
                                key={member.student_id}
                                placement={member}
                                onSeeDetails={onSeeDetails}
                                onChangeGroup={onChangeGroup}
                                onToggleAnchor={onToggleAnchor} />
                        )}
                    </Box>
                </Stack>
            </CardContent>
        </Card>
    );
};
