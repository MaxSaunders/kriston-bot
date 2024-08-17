const randomSort = (array: any[]) => {
    array.sort(() => Math.random() - 0.5)
    return array
}

export const randomTeamGenerator = (numberOfTeams: number, people: string[]) => {
    const randomSortedPeople = randomSort(people)

    const teams: string[][] = []
    let teamIndex = 0
    function iterateTeamIndex() {
        if (teamIndex < numberOfTeams - 1) {
            teamIndex++
        } else {
            teamIndex = 0
        }
    }

    for (const element of randomSortedPeople) {
        if (teams[teamIndex]) {
            teams[teamIndex].push(element)
        } else {
            teams[teamIndex] = [element]
        }
        iterateTeamIndex()
    }

    return teams
}
