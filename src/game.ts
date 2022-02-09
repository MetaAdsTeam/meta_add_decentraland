import * as utils from '@dcl/ecs-scene-utils'

var update_date: any = null

var screen = new Entity()
screen.addComponent(new PlaneShape())

var scale = new Vector3(8, 4.5, 1)
var position = new Vector3(15, 1 + scale.y / 2, 4 + scale.x / 2)
var rotation = new Quaternion(360, 1, 360, 1)

screen.addComponent(
    new Transform({
        position: position,
        scale: scale,
        rotation: rotation,
    })
)

var myVideoClip: VideoClip
var myVideoTexture: VideoTexture
var myImageTexture: Texture
var myMaterial: Material

myMaterial = new Material()
myMaterial.roughness = 1
myMaterial.specularIntensity = 0
myMaterial.metallic = 0


function create_display(stream: any){
    if (stream.is_image){
        myImageTexture = new Texture(stream.url)
        myMaterial.albedoTexture = myImageTexture
        
        if (myVideoTexture && myVideoTexture.playing){
            myVideoTexture.pause()
        }
        
        rotation = new Quaternion(360, 1, 360, 1)
    }
    else {
        myVideoClip = new VideoClip(stream.url)

        myVideoTexture = new VideoTexture(myVideoClip)
        myVideoTexture.loop = true
        myMaterial.albedoTexture = myVideoTexture
        
        myVideoTexture.play()
        
        rotation = new Quaternion(0, -1, 0, 1)
    }
    
    screen.addComponentOrReplace(
        new Transform({
            position: position,
            scale: scale,
            rotation: rotation,
        })
    )
    screen.addComponentOrReplace(myMaterial)
}


function date_without_timezone(string_date: string) {
    let date = new Date(string_date)
    if (date == null) return date
    var timestamp = date.getTime() - date.getTimezoneOffset() * 60000
    var correctDate = new Date(timestamp)
    return correctDate
}


function get_default_image_json(){
    return {
        'is_image': true,
        'url': 'https://metaads.team/data/default.png'
    }
}


async function get_data() {
    let json = await utils.sendRequest(
        'https://metaads.team/tornado/adspot/id/1/stream',
        'GET',
    )

    let message = json.msg
    if (message){
        // 404 
        if (message == 'There are no stream now'){
            update_date = null
            json = get_default_image_json()
            log('Nothing to show at the moment')
        }
        // 200
        if (message == 'ok'){
            update_date = date_without_timezone(json.to_time)
            log((json.is_image ? 'Image' : 'Video') + ' was got')
        }
    }
    // nothing was returned
    else {
        update_date = null
        json = get_default_image_json()
        log('API doesn\'t respond')
    }
    create_display(json)
}


let checker = new Entity()
engine.addEntity(checker)
checker.addComponent(
    new utils.Interval(5000, () => {
        let now = new Date();
        if (update_date == null || update_date < now){
            executeTask(async () => {
                await get_data()
            })
        }
    })
)
engine.addEntity(screen)
